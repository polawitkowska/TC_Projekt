import jwt
import requests
import json
from functools import wraps
from flask import request, jsonify, current_app
import logging

logger = logging.getLogger(__name__)

class KeycloakValidator:
    def __init__(self, keycloak_url, realm):
        self.keycloak_url = keycloak_url
        self.realm = realm
        self.public_key = None
        self.realm_url = f"{keycloak_url}/realms/{realm}"
        
    def get_public_key(self):
        """Get the public key from Keycloak"""
        try:
            response = requests.get(f"{self.realm_url}")
            if response.status_code == 200:
                realm_info = response.json()
                public_key = realm_info.get('public_key')
                if public_key:
                    formatted_key = f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----"
                    self.public_key = formatted_key
                    return formatted_key
            
            certs_response = requests.get(f"{self.realm_url}/protocol/openid_connect/certs")
            if certs_response.status_code == 200:
                certs = certs_response.json()
           
                if certs.get('keys'):
                    logger.info("Retrieved certs from Keycloak")
                    return True
                    
        except Exception as e:
            logger.error(f"Error getting public key from Keycloak: {e}")
            
        return None
    
    def validate_token(self, token):
        """Validate a Keycloak token"""
        try:            # Decode without verification first to get the payload
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            
            # Accept both internal and external Keycloak URLs
            expected_issuers = [
                self.realm_url,  # http://keycloak:8080/realms/TCApp
                f"http://localhost:30080/realms/{self.realm}",  # External access
                f"http://192.168.49.2:30080/realms/{self.realm}"  # Minikube external IP
            ]
            
            token_issuer = unverified_payload.get('iss')
            if token_issuer not in expected_issuers:
                logger.error(f"Invalid issuer: {token_issuer}, expected one of: {expected_issuers}")
                return None
                
            if unverified_payload.get('typ') != 'Bearer':
                logger.error("Invalid token type")
                return None
            
            
            return unverified_payload
            
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error validating token: {e}")
            return None

keycloak_validator = KeycloakValidator(
    keycloak_url="http://keycloak:8080",
    realm="TCApp"
)

def keycloak_required(f):
    """Decorator to require valid Keycloak token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header provided'}), 401
            
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        user_info = keycloak_validator.validate_token(token)
        
        if not user_info:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.current_user = user_info
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user_id():
    """Get the current user ID from the token, mapped to local database user"""
    try:
        if hasattr(request, 'current_user'):
            keycloak_user_id = request.current_user.get('sub')
            user_email = request.current_user.get('email')
            
            logger.info(f"Getting user ID for Keycloak user: {keycloak_user_id}, email: {user_email}")
            
            from models import User, db
            if user_email:
                user = User.query.filter_by(email=user_email).first()
                if user:
                    logger.info(f"Found existing user: {user.id}")
                    return str(user.id)
            
            if user_email and keycloak_user_id:
                logger.info("Creating new user")
                username = request.current_user.get('preferred_username', user_email.split('@')[0])
                new_user = User(
                    username=username,
                    email=user_email
                )
                new_user.set_password('keycloak_auth')
                db.session.add(new_user)
                db.session.commit()
                logger.info(f"Created new user: {new_user.id}")
                return str(new_user.id)
                
        logger.error("No current_user or missing email/sub")
        return None
    except Exception as e:
        logger.error(f"Error in get_current_user_id: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def get_current_user_info():
    """Get full user info from Keycloak token"""
    if hasattr(request, 'current_user'):
        return request.current_user
    return None

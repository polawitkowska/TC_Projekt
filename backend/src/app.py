from flask import Flask, render_template, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.users import users_bp
from routes.cosmetics import cosmetics_bp
from datetime import timedelta
from logger import get_logger
import os
from dotenv import load_dotenv
import traceback
import json

load_dotenv()
jwt_secret_key=os.getenv("jwt_secret_key")

app = Flask(__name__)
logger = get_logger()

CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],               
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],    
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['JWT_SECRET_KEY'] = jwt_secret_key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@db:5432/cosmetics'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(users_bp)
app.register_blueprint(cosmetics_bp)

@app.before_request
def log_request_info():
    logger.info(f'Request: {request.method} {request.path} from {request.remote_addr}')

@app.after_request
def log_response_info(response):
    logger.info(f'Response: {response.status}')
    return response

@app.errorhandler(Exception)
def log_exception(error):
    trace = traceback.format_exc()
    logger.error(f"Exception occurred: {error}\n{trace}")
    return json.jsonify({"error": str(error), "trace": trace}), 500

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/account')
def account():
    return render_template('account.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(debug=True, host='0.0.0.0', port=5000)

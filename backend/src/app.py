from flask import Flask, render_template, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.users import users_bp
from routes.cosmetics import cosmetics_bp
from datetime import timedelta
from logger import get_logger

app = Flask(__name__)
logger = get_logger()

#to pozwala wysyłać requesty w skrypcie w czytelny sposób
CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],               
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],    
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['JWT_SECRET_KEY'] = 'your-secret-key-here'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.before_request
def log_request_info():
    logger.info(f'Request: {request.method} {request.path} from {request.remote_addr}')

@app.after_request
def log_response_info(response):
    logger.info(f'Response: {response.status}')
    return response

@app.errorhandler(Exception)
def log_exception(error):
    logger.error(f'Error: {str(error)}')
    return 'Internal Server Error', 500

jwt = JWTManager(app)
db.init_app(app)

app.register_blueprint(users_bp)
app.register_blueprint(cosmetics_bp)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/account')
def account():
    return render_template('account.html')

if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all() 
    app.run(debug=True)

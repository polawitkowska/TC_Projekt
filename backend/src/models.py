from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Konfiguracja
app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Tabele
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

    reviews = db.relationship('Review', backref='user', lazy=True)
    saved_cosmetics = db.relationship('Cosmetic', 
                                    secondary='saved_cosmetics',
                                    backref=db.backref('saved_by_users', lazy='dynamic'),
                                    lazy='dynamic')

class Cosmetic(db.Model):
    __tablename__ = 'cosmetics'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=True)

    reviews = db.relationship('Review', backref='cosmetic', lazy=True)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text(150), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cosmetic_id = db.Column(db.Integer, db.ForeignKey('cosmetics.id'), nullable=False)

class SavedCosmetic(db.Model):
    __tablename__ = 'saved_cosmetics'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cosmetic_id = db.Column(db.Integer, db.ForeignKey('cosmetics.id'), nullable=False)

# Inicjalizacja bazy danych
with app.app_context():
    db.create_all()
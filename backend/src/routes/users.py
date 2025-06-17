from flask import Blueprint, request, jsonify
from models import User, Review, Cosmetic, db
from flask_cors import CORS
from keycloak_validator import keycloak_required, get_current_user_id

users_bp = Blueprint('users', __name__)
CORS(users_bp, origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"], supports_credentials=True)

@users_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400

    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully", "id": new_user.id}), 201

@users_bp.route('/users/login', methods=['POST'])
def login():
    return jsonify({"message": "Please use Keycloak for authentication"}), 410

@users_bp.route('/users/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username, "email": user.email})

@users_bp.route('/users/<user_id>', methods=['PATCH'])
@keycloak_required
def update_user(user_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)
    data = request.get_json()

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if current_user_id == user_id:
        if 'username' in data:
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Username already taken"}), 403
            user.username = data['username']
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Email already taken"}), 403
            user.email = data['email']
        if 'password' in data:
            user.set_password(data['password'])
    else:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 401

    db.session.commit()
    
    return jsonify({"message": "User data updated", "id": user.id, "username": user.username, "email": user.email}), 200

@users_bp.route('/users/<user_id>', methods=['DELETE'])
@keycloak_required
def delete_account(user_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)
    reviews_of_user = Review.query.filter_by(user_id=user_id).all()

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if current_user_id != user_id:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 401
    
    if not reviews_of_user:
        db.session.delete(user)
        db.session.commit()
    else:
        for review in reviews_of_user:
            db.session.delete(review)
        db.session.delete(user)
        db.session.commit()

    return jsonify({"message": f"User of id {user_id} deleted."}), 200
    
@users_bp.route('/users/<user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    reviews = Review.query.filter_by(user_id=user_id).all()
    if not reviews:
        return jsonify({"message": "User doesn't have any reviews"}), 200
    
    reviews_data = [{
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "user": review.user.username,
        "cosmetic_id": review.cosmetic_id
    } for review in reviews]
    return jsonify(reviews_data), 200

@users_bp.route('/reviews/<review_id>', methods=['GET'])
def get_review_by_id(review_id):
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"message": "Review not found"}), 404
    
    return jsonify({"message": "Review found", "id": review.id, "rating": review.rating, "comment": review.comment, "user_id": review.user_id, "cosmetic_id": review.cosmetic_id})

@users_bp.route('/users/<user_id>/reviews/<review_id>', methods=['PATCH'])
@keycloak_required
def edit_review(user_id, review_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)

    review = Review.query.get(review_id)
    data = request.get_json()

    if not user or not review:
        return jsonify({"message": "User or review not found"}), 404

    if current_user_id != user_id:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 401
    
    if 'rating' in data:
        review.rating = data['rating']
    if 'comment' in data:
        review.comment = data['comment']

    db.session.commit()
    return jsonify({"message": "Review updated successfully"}), 200

@users_bp.route('/users/<user_id>/reviews/<review_id>', methods=['DELETE'])
@keycloak_required
def delete_reviews_user(user_id, review_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)

    reviews_of_user = Review.query.filter_by(user_id=user_id).all()
    review = next((r for r in reviews_of_user if str(r.id) == review_id), None)

    if not user or not review:
        return jsonify({"error": "User or review not found"}), 404
    
    if current_user_id != user_id:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 401
    
    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": f"Review of id {review_id} deleted."}), 200

@users_bp.route('/users/<user_id>/saved_cosmetics', methods=["GET"])
@keycloak_required
def get_saved_cosmetics(user_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message":  "User not found"}), 404
    
    if current_user_id != user_id:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 400
    
    saved_cosmetics = user.saved_cosmetics
    saved_cosmetics_data = [{
        "id": cosmetic.id,
        "name": cosmetic.name,
        "brand": cosmetic.brand,
        "category": cosmetic.category
    } for cosmetic in saved_cosmetics]

    return jsonify(saved_cosmetics_data), 200

@users_bp.route('/users/<user_id>/cosmetics/<cosmetic_id>/saved', methods=["DELETE"])
@keycloak_required
def delete_saved_cosmetic(user_id, cosmetic_id):
    current_user_id = get_current_user_id()
    user = User.query.get(user_id)
    cosmetic = Cosmetic.query.get(cosmetic_id)

    if not cosmetic:
        return jsonify({"message":  "Cosmetic not found"}), 404
    
    if current_user_id != user_id:
        return jsonify({"message": "You need to be logged in in order to proceed"}), 401
    
    if cosmetic not in user.saved_cosmetics:
        return jsonify({"message": "Cosmetic not saved"}), 400

    user.saved_cosmetics.remove(cosmetic)
    db.session.commit()

    return jsonify({
        "message": "Cosmetic removed from saved successfully",
        "cosmetic": {
            "id": cosmetic.id,
            "name": cosmetic.name,
            "brand": cosmetic.brand
        }
    }), 200

@users_bp.route('/users/me', methods=['GET'])
@keycloak_required
def get_current_user():
    """Get current user information based on Keycloak token"""
    current_user_id = get_current_user_id()
    
    if not current_user_id:
        return jsonify({"error": "User not found"}), 404
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found in database"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200

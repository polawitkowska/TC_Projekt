from flask import Blueprint, request, jsonify
from models import Cosmetic, Review, User, db
from sqlalchemy import or_
from flask_jwt_extended import jwt_required, get_jwt_identity

cosmetics_bp = Blueprint('cosmetics', __name__)

@cosmetics_bp.route('/cosmetics', methods=['POST'])
def add_cosmetic():
    data = request.get_json()
    if not data.get('name') or not data.get('brand'):
        return jsonify({"error": "Name and Brand are required"}), 400

    new_cosmetic = Cosmetic(name=data['name'], brand=data['brand'], category=data.get('category'))
    db.session.add(new_cosmetic)
    db.session.commit()
    return jsonify({"message": "Product added successfully", "id": new_cosmetic.id}), 201

@cosmetics_bp.route('/cosmetics/<int:cosmetic_id>', methods=['GET'])
def get_cosmetic_by_id(cosmetic_id):
    cosmetic = Cosmetic.query.get(cosmetic_id)
    return jsonify({"id": cosmetic.id, "name": cosmetic.name, "brand": cosmetic.brand, "category": cosmetic.category})

@cosmetics_bp.route('/cosmetics/<phrase>', methods=['GET'])
def search_cosmetics(phrase):
    cosmetics = Cosmetic.query.filter(or_(
            Cosmetic.brand.ilike(f'%{phrase}%'),
            Cosmetic.name.ilike(f'%{phrase}%'),
            # Cosmetic.category.ilike(f'%{phrase}%')
        )).all()
    return jsonify([{"id": c.id, "name": c.name, "brand": c.brand, "category": c.category} for c in cosmetics])

@cosmetics_bp.route('/cosmetics/<cosmetic_id>', methods=['PATCH'])
def update_cosmetic(cosmetic_id):
    cosmetic = Cosmetic.query.get(cosmetic_id)
    data = request.get_json()

    if not cosmetic:
        return jsonify({"error": "Cosmetic not found"}), 404
    
    if 'name' in data:
        cosmetic.name = data['name']
    if 'brand' in data:
        cosmetic.brand = data['brand']
    if 'category' in data:
        cosmetic.category = data['category']

    db.session.commit()
    
    return jsonify({"message": "Cosmetic updated", "id": cosmetic.id, "name": cosmetic.name, "brand": cosmetic.brand, "category": cosmetic.category})

@cosmetics_bp.route('/cosmetics/<cosmetic_id>/reviews', methods=['POST'])
@jwt_required()
def post_review(cosmetic_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('rating'):
        return jsonify({"error": "Missing required fields"}), 400
    
    new_review = Review(rating=data['rating'], comment=data['comment'], user_id=current_user_id, cosmetic_id=cosmetic_id)
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Review posted successfully", "id": new_review.id}), 201

@cosmetics_bp.route('/cosmetics/<cosmetic_id>/reviews', methods=['GET'])
def get_cosmetic_reviews(cosmetic_id):
    reviews = Review.query.filter_by(cosmetic_id=cosmetic_id).all()
    if not reviews:
        return jsonify({"message": "No reviews found for this cosmetic"}), 404
    
    reviews_data = [{
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "user": review.user.username,
        "cosmetic_id": review.cosmetic_id,
        "user_id": review.user_id
    } for review in reviews]
    return jsonify(reviews_data), 200

@cosmetics_bp.route('/cosmetics/<cosmetic_id>/save', methods=["POST"])
@jwt_required()
def save_cosmetic(cosmetic_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    cosmetic = Cosmetic.query.get(cosmetic_id)

    if not cosmetic:
        return jsonify({"message":  "Cosmetic not found"}), 404
    
    if cosmetic in user.saved_cosmetics:
        return jsonify({"message": "Cosmetic already saved"}), 400

    user.saved_cosmetics.append(cosmetic)
    db.session.commit()

    return jsonify({
        "message": "Cosmetic saved successfully",
        "cosmetic": {
            "id": cosmetic.id,
            "name": cosmetic.name,
            "brand": cosmetic.brand
        }
    }), 201

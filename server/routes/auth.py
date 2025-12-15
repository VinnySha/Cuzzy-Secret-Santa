from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        secret_key = data.get("secretKey")

        if not secret_key:
            return jsonify({"error": "Secret key is required"}), 400

        # Get database from app config
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        # Find user by comparing secret key
        users = user_model.find_all()
        user = None

        for u in users:
            if user_model.verify_secret_key(u, secret_key):
                user = u
                break

        if not user:
            return jsonify({"error": "Invalid secret key"}), 401

        # Generate JWT token
        token = create_access_token(
            identity=str(user["_id"]),
            additional_claims={"userName": user["name"]},
            expires_delta=timedelta(days=7)
        )

        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
            },
        })
    except Exception as error:
        print(f"Login error: {error}")
        return jsonify({"error": "Server error during login"}), 500


@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        
        user_id = get_jwt_identity()
        
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
            },
        })
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401


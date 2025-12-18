from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        name = data.get("name")
        secret_key = data.get("secretKey")

        if not secret_key:
            return jsonify({"error": "Secret key is required"}), 400

        # Get database from app config
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        # If name is provided, find user by name first
        if name:
            user = user_model.find_by_name(name)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Verify secret key for this specific user
            if not user_model.verify_secret_key(user, secret_key):
                return jsonify({"error": "Invalid secret key"}), 401
        else:
            # Legacy: Find user by comparing secret key across all users
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


@auth_bp.route("/users", methods=["GET"])
def get_users():
    """Get list of all users (names only)"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        
        users = user_model.find_all()
        user_names = [{"name": user["name"]} for user in users]
        
        return jsonify({"users": user_names})
    except Exception as error:
        print(f"Get users error: {error}")
        return jsonify({"error": "Server error"}), 500


@auth_bp.route("/users/<name>/check-key", methods=["GET"])
def check_key(name):
    """Check if a user has a secret key set"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        
        user = user_model.find_by_name(name)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        has_key = user_model.has_secret_key(user)
        
        return jsonify({
            "hasKey": has_key,
            "name": user["name"]
        })
    except Exception as error:
        print(f"Check key error: {error}")
        return jsonify({"error": "Server error"}), 500


@auth_bp.route("/users/<name>/verify-key", methods=["POST"])
def verify_key(name):
    """Verify if the provided secret key is correct for a user"""
    try:
        data = request.get_json()
        secret_key = data.get("secretKey")
        
        if not secret_key:
            return jsonify({"error": "Secret key is required"}), 400
        
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        
        user = user_model.find_by_name(name)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Verify the secret key
        is_valid = user_model.verify_secret_key(user, secret_key)
        
        return jsonify({
            "valid": is_valid,
            "name": user["name"]
        })
    except Exception as error:
        print(f"Verify key error: {error}")
        return jsonify({"error": "Server error"}), 500


@auth_bp.route("/users/<name>/set-key", methods=["POST"])
def set_key(name):
    """Set or update a user's secret key"""
    try:
        data = request.get_json()
        secret_key = data.get("secretKey")
        current_key = data.get("currentKey")  # Optional, for verification when updating
        
        if not secret_key:
            return jsonify({"error": "Secret key is required"}), 400
        
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        
        user = user_model.find_by_name(name)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # If current_key is provided, verify it before updating
        if current_key:
            if not user_model.verify_secret_key(user, current_key):
                return jsonify({"error": "Current secret key is incorrect"}), 401
        
        # Update the secret key
        user_model.update_secret_key(str(user["_id"]), secret_key)
        
        return jsonify({
            "message": "Secret key updated successfully",
            "name": user["name"]
        })
    except Exception as error:
        print(f"Set key error: {error}")
        return jsonify({"error": "Server error"}), 500


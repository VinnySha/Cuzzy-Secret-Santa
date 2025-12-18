from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User

assignments_bp = Blueprint("assignments", __name__)


@assignments_bp.route("/my-assignment", methods=["GET"])
@jwt_required()
def get_my_assignment():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.get("assignedTo"):
            return jsonify({
                "assigned": False,
                "message": "No assignment yet. Wait for admin to shuffle!",
            })

        assigned_user = user_model.get_assigned_user(user_id)

        if not assigned_user:
            return jsonify({
                "assigned": False,
                "message": "Assignment not found",
            })

        return jsonify({
            "assigned": True,
            "seenAssignment": user.get("seenAssignment", False),
            "assignedTo": {
                "name": assigned_user["name"],
                "wishlist": assigned_user.get("wishlist", []),
                "questionnaire": assigned_user.get("questionnaire", {}),
            },
        })
    except Exception as error:
        print(f"Get assignment error: {error}")
        return jsonify({"error": "Server error"}), 500


@assignments_bp.route("/my-wishlist", methods=["GET"])
@jwt_required()
def get_my_wishlist():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "wishlist": user.get("wishlist", []),
        })
    except Exception as error:
        print(f"Get wishlist error: {error}")
        return jsonify({"error": "Server error"}), 500


@assignments_bp.route("/my-wishlist", methods=["PUT"])
@jwt_required()
def update_my_wishlist():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        data = request.get_json()
        wishlist = data.get("wishlist")

        if not isinstance(wishlist, list):
            return jsonify({"error": "Wishlist must be an array"}), 400

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_model.update_wishlist(user_id, wishlist)

        return jsonify({
            "message": "Wishlist updated successfully",
            "wishlist": wishlist,
        })
    except Exception as error:
        print(f"Update wishlist error: {error}")
        return jsonify({"error": "Server error"}), 500


@assignments_bp.route("/my-assignment/mark-seen", methods=["POST"])
@jwt_required()
def mark_assignment_seen():
    """Mark that the user has seen their assignment animation"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_model.mark_assignment_seen(user_id)

        return jsonify({
            "message": "Assignment marked as seen",
            "seenAssignment": True,
        })
    except Exception as error:
        print(f"Mark assignment seen error: {error}")
        return jsonify({"error": "Server error"}), 500


@assignments_bp.route("/my-questionnaire", methods=["GET"])
@jwt_required()
def get_my_questionnaire():
    """Get the current user's questionnaire answers"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "questionnaire": user.get("questionnaire", {}),
        })
    except Exception as error:
        print(f"Get questionnaire error: {error}")
        return jsonify({"error": "Server error"}), 500


@assignments_bp.route("/my-questionnaire", methods=["PUT"])
@jwt_required()
def update_my_questionnaire():
    """Update the current user's questionnaire answers"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        data = request.get_json()
        questionnaire = data.get("questionnaire")

        if not isinstance(questionnaire, dict):
            return jsonify({"error": "Questionnaire must be an object"}), 400

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_model.update_questionnaire(user_id, questionnaire)

        return jsonify({
            "message": "Questionnaire updated successfully",
            "questionnaire": questionnaire,
        })
    except Exception as error:
        print(f"Update questionnaire error: {error}")
        return jsonify({"error": "Server error"}), 500


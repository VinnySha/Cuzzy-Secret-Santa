from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.message import Message
from bson import ObjectId
from datetime import timezone

messages_bp = Blueprint("messages", __name__)


def format_datetime_utc(dt):
    """Format datetime to ISO string with UTC timezone indicator (Z suffix)"""
    if dt.tzinfo is None:
        # If naive, assume it's UTC
        dt = dt.replace(tzinfo=timezone.utc)
    # Format with 'Z' suffix to explicitly indicate UTC
    dt_str = dt.isoformat().replace('+00:00', 'Z')
    if not dt_str.endswith('Z'):
        dt_str += 'Z'
    return dt_str


@messages_bp.route("/conversation/assignment", methods=["GET"])
@jwt_required()
def get_assignment_conversation():
    """Get conversation with the user you're assigned to"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        message_model = Message(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.get("assignedTo"):
            return jsonify({
                "messages": [],
                "otherUser": None,
            })

        assigned_user = user_model.get_assigned_user(user_id)
        if not assigned_user:
            return jsonify({
                "messages": [],
                "otherUser": None,
            })

        # Get conversation between current user and assigned user
        messages = message_model.get_conversation(user_id, str(assigned_user["_id"]))

        # Format messages for frontend
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": str(msg["_id"]),
                "message": msg["message"],
                "senderId": str(msg["senderId"]),
                "receiverId": str(msg["receiverId"]),
                "isFromMe": str(msg["senderId"]) == user_id,
                "createdAt": format_datetime_utc(msg["createdAt"]),
            })

        return jsonify({
            "messages": formatted_messages,
            "otherUser": {
                "id": str(assigned_user["_id"]),
                "name": assigned_user["name"],
            },
        })
    except Exception as error:
        print(f"Get assignment conversation error: {error}")
        return jsonify({"error": "Server error"}), 500


@messages_bp.route("/conversation/santa", methods=["GET"])
@jwt_required()
def get_santa_conversation():
    """Get conversation with the user who is assigned to you (your Secret Santa)"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        message_model = Message(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Find who is assigned to this user
        santa = user_model.get_user_assigned_to_me(user_id)
        if not santa:
            return jsonify({
                "messages": [],
                "otherUser": None,
            })

        # Get conversation between current user and their Secret Santa
        messages = message_model.get_conversation(user_id, str(santa["_id"]))

        # Format messages for frontend
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": str(msg["_id"]),
                "message": msg["message"],
                "senderId": str(msg["senderId"]),
                "receiverId": str(msg["receiverId"]),
                "isFromMe": str(msg["senderId"]) == user_id,
                "createdAt": format_datetime_utc(msg["createdAt"]),
            })

        return jsonify({
            "messages": formatted_messages,
            "otherUser": {
                "id": str(santa["_id"]),
                "name": santa["name"],
            },
        })
    except Exception as error:
        print(f"Get santa conversation error: {error}")
        return jsonify({"error": "Server error"}), 500


@messages_bp.route("/send/assignment", methods=["POST"])
@jwt_required()
def send_message_to_assignment():
    """Send a message to the user you're assigned to"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        message_model = Message(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.get("assignedTo"):
            return jsonify({"error": "No assignment yet"}), 400

        data = request.get_json()
        message_text = data.get("message", "").strip()

        if not message_text:
            return jsonify({"error": "Message cannot be empty"}), 400

        # Create message
        message = message_model.create(user_id, str(user["assignedTo"]), message_text)

        return jsonify({
            "message": {
                "id": str(message["_id"]),
                "message": message["message"],
                "senderId": str(message["senderId"]),
                "receiverId": str(message["receiverId"]),
                "isFromMe": True,
                "createdAt": format_datetime_utc(message["createdAt"]),
            },
        })
    except Exception as error:
        print(f"Send message to assignment error: {error}")
        return jsonify({"error": "Server error"}), 500


@messages_bp.route("/send/santa", methods=["POST"])
@jwt_required()
def send_message_to_santa():
    """Send a message to the user who is assigned to you (your Secret Santa)"""
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)
        message_model = Message(db)

        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Find who is assigned to this user
        santa = user_model.get_user_assigned_to_me(user_id)
        if not santa:
            return jsonify({"error": "No Secret Santa assigned to you yet"}), 400

        data = request.get_json()
        message_text = data.get("message", "").strip()

        if not message_text:
            return jsonify({"error": "Message cannot be empty"}), 400

        # Create message
        message = message_model.create(user_id, str(santa["_id"]), message_text)

        return jsonify({
            "message": {
                "id": str(message["_id"]),
                "message": message["message"],
                "senderId": str(message["senderId"]),
                "receiverId": str(message["receiverId"]),
                "isFromMe": True,
                "createdAt": format_datetime_utc(message["createdAt"]),
            },
        })
    except Exception as error:
        print(f"Send message to santa error: {error}")
        return jsonify({"error": "Server error"}), 500


from flask import Blueprint, request, jsonify, current_app
from models.user import User
import random

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/init-users", methods=["POST"])
def init_users():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        data = request.get_json()
        users_data = data.get("users", [])

        if not isinstance(users_data, list) or len(users_data) == 0:
            return jsonify({"error": "Users array is required"}), 400

        created_users = []
        errors = []

        for user_data in users_data:
            try:
                name = user_data.get("name")
                secret_key = user_data.get("secretKey")  # Optional

                if not name:
                    errors.append({
                        "name": "Unknown",
                        "error": "Name is required",
                    })
                    continue

                # Check if user already exists
                existing = user_model.find_by_name(name)
                if existing:
                    errors.append({"name": name, "error": "User already exists"})
                    continue

                # Create user with or without secret key
                user = user_model.create(name, secret_key)
                created_users.append({"name": user["name"], "id": str(user["_id"])})
            except Exception as error:
                errors.append({"name": user_data.get("name", "Unknown"), "error": str(error)})

        response = {
            "message": "Users initialized",
            "created": created_users,
        }
        if errors:
            response["errors"] = errors

        return jsonify(response)
    except Exception as error:
        print(f"Init users error: {error}")
        return jsonify({"error": "Server error"}), 500


@admin_bp.route("/shuffle", methods=["POST"])
def shuffle():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        users = user_model.find_all()

        if len(users) < 2:
            return jsonify({"error": "Need at least 2 users to shuffle"}), 400

        # Fisher-Yates shuffle
        shuffled = users.copy()
        attempts = 0
        max_attempts = 100

        while attempts < max_attempts:
            random.shuffle(shuffled)

            # Check if valid (no self-assignments)
            valid = True
            for i in range(len(users)):
                if str(users[i]["_id"]) == str(shuffled[i]["_id"]):
                    valid = False
                    break

            if valid:
                # Reset seenAssignment for all users first
                user_model.reset_all_seen_assignments()
                # Assign
                for i in range(len(users)):
                    user_model.update_assignment(
                        str(users[i]["_id"]), str(shuffled[i]["_id"])
                    )

                assignments = [
                    {"name": users[i]["name"], "assignedTo": shuffled[i]["name"]}
                    for i in range(len(users))
                ]

                return jsonify({
                    "message": "Assignments shuffled successfully",
                    "assignments": assignments,
                })

            attempts += 1

        # Fallback: force fix self-assignments
        # Reset seenAssignment for all users first
        user_model.reset_all_seen_assignments()
        for i in range(len(users)):
            if str(users[i]["_id"]) == str(shuffled[i]["_id"]):
                next_index = (i + 1) % len(shuffled)
                shuffled[i], shuffled[next_index] = shuffled[next_index], shuffled[i]
            user_model.update_assignment(
                str(users[i]["_id"]), str(shuffled[i]["_id"])
            )

        assignments = [
            {"name": users[i]["name"], "assignedTo": shuffled[i]["name"]}
            for i in range(len(users))
        ]

        return jsonify({
            "message": "Assignments shuffled (with fallback fix)",
            "assignments": assignments,
        })
    except Exception as error:
        print(f"Shuffle error: {error}")
        return jsonify({"error": "Server error during shuffle"}), 500


@admin_bp.route("/users", methods=["GET"])
def get_users():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        users = user_model.find_all()
        users_list = []

        for user in users:
            user_data = {
                "id": str(user["_id"]),
                "name": user["name"],
            }
            if user.get("assignedTo"):
                assigned_user = user_model.find_by_id(user["assignedTo"])
                if assigned_user:
                    user_data["assignedTo"] = assigned_user["name"]
            users_list.append(user_data)

        return jsonify({"users": users_list})
    except Exception as error:
        print(f"Get users error: {error}")
        return jsonify({"error": "Server error"}), 500


@admin_bp.route("/clear-assignments", methods=["POST"])
def clear_assignments():
    try:
        db = current_app.config["MONGO_DB"]
        user_model = User(db)

        user_model.clear_all_assignments()
        return jsonify({"message": "All assignments cleared"})
    except Exception as error:
        print(f"Clear assignments error: {error}")
        return jsonify({"error": "Server error"}), 500


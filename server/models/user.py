from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime, timezone


class User:
    def __init__(self, db):
        self.collection = db.users

    def create(self, name, secret_key=None):
        """Create a new user with optional secret key"""
        user = {
            "name": name,
            "secretKey": None,
            "assignedTo": None,
            "wishlist": [],
            "createdAt": datetime.now(timezone.utc),
        }
        
        # Only hash and set secret key if provided
        if secret_key:
            hashed_key = bcrypt.hashpw(secret_key.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            user["secretKey"] = hashed_key
        
        result = self.collection.insert_one(user)
        user["_id"] = result.inserted_id
        return user

    def find_by_name(self, name):
        """Find user by name"""
        return self.collection.find_one({"name": name})

    def find_by_id(self, user_id):
        """Find user by ID"""
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def find_all(self):
        """Find all users"""
        return list(self.collection.find({}))

    def verify_secret_key(self, user, secret_key):
        """Verify secret key against stored hash"""
        if not user or "secretKey" not in user or user["secretKey"] is None:
            return False
        return bcrypt.checkpw(secret_key.encode("utf-8"), user["secretKey"].encode("utf-8"))

    def update_assignment(self, user_id, assigned_to_id):
        """Update user's assignment"""
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"assignedTo": ObjectId(assigned_to_id)}}
        )

    def update_wishlist(self, user_id, wishlist):
        """Update user's wishlist"""
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"wishlist": wishlist}}
        )

    def clear_all_assignments(self):
        """Clear all assignments"""
        self.collection.update_many({}, {"$set": {"assignedTo": None}})

    def get_assigned_user(self, user_id):
        """Get the user that this user is assigned to"""
        user = self.find_by_id(user_id)
        if not user or not user.get("assignedTo"):
            return None
        
        assigned_user = self.find_by_id(user["assignedTo"])
        return assigned_user

    def update_secret_key(self, user_id, secret_key):
        """Update user's secret key"""
        hashed_key = bcrypt.hashpw(secret_key.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"secretKey": hashed_key}}
        )

    def has_secret_key(self, user):
        """Check if user has a secret key set"""
        return user and "secretKey" in user and user["secretKey"] is not None


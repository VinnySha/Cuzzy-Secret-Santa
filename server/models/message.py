from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone


class Message:
    def __init__(self, db):
        self.collection = db.messages

    def create(self, sender_id, receiver_id, message):
        """Create a new message"""
        message_doc = {
            "senderId": ObjectId(sender_id),
            "receiverId": ObjectId(receiver_id),
            "message": message,
            "createdAt": datetime.now(timezone.utc),
        }
        result = self.collection.insert_one(message_doc)
        message_doc["_id"] = result.inserted_id
        return message_doc

    def get_conversation(self, user1_id, user2_id):
        """Get all messages between two users"""
        messages = list(
            self.collection.find(
                {
                    # this $or query is supposedly pretty efficient
                    "$or": [
                        {
                            "senderId": ObjectId(user1_id),
                            "receiverId": ObjectId(user2_id),
                        },
                        {
                            "senderId": ObjectId(user2_id),
                            "receiverId": ObjectId(user1_id),
                        },
                    ]
                }
            ).sort("createdAt", 1)
        )
        return messages

    def get_messages_sent_to(self, receiver_id):
        """Get all messages sent to a user"""
        messages = list(
            self.collection.find({"receiverId": ObjectId(receiver_id)}).sort(
                "createdAt", 1
            )
        )
        return messages

    def get_messages_sent_by(self, sender_id):
        """Get all messages sent by a user"""
        messages = list(
            self.collection.find({"senderId": ObjectId(sender_id)}).sort(
                "createdAt", 1
            )
        )
        return messages


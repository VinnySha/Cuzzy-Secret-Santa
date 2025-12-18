"""
Script to delete all messages from the database
Run with: python scripts/clear_messages.py

This will permanently delete all message documents from the messages collection
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


def clear_messages():
    """Delete all messages from the database"""
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/secret-santa")
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        messages_collection = db.messages

        print("✅ Connected to MongoDB")
        
        # Count messages before deletion
        message_count = messages_collection.count_documents({})
        print(f"\n📊 Found {message_count} message(s) in the database")
        
        if message_count == 0:
            print("✅ No messages to delete")
            return
        
        print("\n🗑️  Deleting all messages...")

        # Delete all messages
        result = messages_collection.delete_many({})

        print(f"\n✅ Successfully deleted {result.deleted_count} message(s)")
        
        # Verify deletion
        remaining_messages = messages_collection.count_documents({})
        if remaining_messages == 0:
            print("✅ Verification: All messages have been deleted")
        else:
            print(f"⚠️  Warning: {remaining_messages} message(s) still remain")

    except Exception as error:
        print(f"❌ Fatal error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    clear_messages()


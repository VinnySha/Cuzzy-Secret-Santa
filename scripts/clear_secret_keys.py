"""
Script to clear all secret keys from users in the database
Run with: python scripts/clear_secret_keys.py

This will set all users' secretKey field to None
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


def clear_secret_keys():
    """Clear all secret keys from users"""
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/secret-santa")
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        users_collection = db.users

        print("✅ Connected to MongoDB")
        print("\n🔄 Clearing all secret keys...")

        # Update all users to set secretKey to None
        result = users_collection.update_many(
            {},
            {"$set": {"secretKey": None}}
        )

        print(f"\n✅ Successfully cleared secret keys for {result.modified_count} user(s)")
        
        # Show which users were updated
        users = list(users_collection.find({}, {"name": 1, "secretKey": 1}))
        if users:
            print("\n📋 Updated users:")
            for user in users:
                key_status = "None" if user.get("secretKey") is None else "Still set"
                print(f"   - {user['name']}: secretKey = {key_status}")

    except Exception as error:
        print(f"❌ Fatal error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    # Confirm before proceeding
    print("⚠️  WARNING: This will clear ALL secret keys for ALL users!")
    print("   Users will need to set their secret keys again.")
    response = input("\n   Continue? (yes/no): ")
    
    if response.lower() in ["yes", "y"]:
        clear_secret_keys()
    else:
        print("\n❌ Operation cancelled.")
        sys.exit(0)


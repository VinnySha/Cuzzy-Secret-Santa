"""
Script to initialize users in the database
Run with: python scripts/init_users.py

Make sure to set MONGODB_URI in your .env file first
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime, timezone

# Add parent directory to path to import User model
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

COUSINS = [
    {"name": "Charvi", "secretKey": "charvi2025"},
    {"name": "Rohan", "secretKey": "rohan2025"},
    {"name": "Vinny", "secretKey": "vinny2025"},
    {"name": "Isha", "secretKey": "isha2025"},
    {"name": "Praneil", "secretKey": "praneil2025"},
    {"name": "Rohil", "secretKey": "rohil2025"},
]


def init_users():
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/secret-santa")
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        users_collection = db.users

        print("✅ Connected to MongoDB")

        # Create users
        created_users = []
        errors = []

        for cousin in COUSINS:
            try:
                # Check if user already exists
                existing = users_collection.find_one({"name": cousin["name"]})
                if existing:
                    print(f"⚠️  {cousin['name']} already exists, skipping...")
                    errors.append({"name": cousin["name"], "error": "Already exists"})
                    continue

                # Hash secret key
                hashed_key = bcrypt.hashpw(
                    cousin["secretKey"].encode("utf-8"), bcrypt.gensalt()
                ).decode("utf-8")

                user = {
                    "name": cousin["name"],
                    "secretKey": hashed_key,
                    "assignedTo": None,
                    "wishlist": [],
                    "createdAt": datetime.now(timezone.utc),
                }

                result = users_collection.insert_one(user)
                created_users.append({"name": cousin["name"], "id": str(result.inserted_id)})
                print(f"✅ Created user: {cousin['name']}")
            except Exception as error:
                print(f"❌ Error creating {cousin['name']}: {error}")
                errors.append({"name": cousin["name"], "error": str(error)})

        print("\n📊 Summary:")
        print(f"✅ Created: {len(created_users)} users")
        if errors:
            print(f"⚠️  Errors: {len(errors)}")
            for e in errors:
                print(f"   - {e['name']}: {e['error']}")

        print("\n🔑 Secret Keys (share these with each cousin):")
        for c in COUSINS:
            print(f"   {c['name']}: {c['secretKey']}")

    except Exception as error:
        print(f"❌ Fatal error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    init_users()


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

CUZZYS = [
    {"name": "Charvi"},
    {"name": "Rohan"},
    {"name": "Vinny"},
    {"name": "Isha"},
    {"name": "Praneil"},
    {"name": "Rohil"},
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

        for cuzzy in CUZZYS:
            try:
                # Check if user already exists
                existing = users_collection.find_one({"name": cuzzy["name"]})
                if existing:
                    print(f"⚠️  {cuzzy['name']} already exists, skipping...")
                    errors.append({"name": cuzzy["name"], "error": "Already exists"})
                    continue

                # Create user without secret key (users will set it themselves)
                user = {
                    "name": cuzzy["name"],
                    "secretKey": None,
                    "assignedTo": None,
                    "wishlist": [],
                    "createdAt": datetime.now(timezone.utc),
                }

                result = users_collection.insert_one(user)
                created_users.append({"name": cuzzy["name"], "id": str(result.inserted_id)})
                print(f"✅ Created user: {cuzzy['name']}")
            except Exception as error:
                print(f"❌ Error creating {cuzzy['name']}: {error}")
                errors.append({"name": cuzzy["name"], "error": str(error)})

        print("\n📊 Summary:")
        print(f"✅ Created: {len(created_users)} users")
        if errors:
            print(f"⚠️  Errors: {len(errors)}")
            for e in errors:
                print(f"   - {e['name']}: {e['error']}")

        print("\n📝 Note: Users are created without secret keys.")
        print("   Each user will need to set their secret key when they first log in.")

    except Exception as error:
        print(f"❌ Fatal error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    init_users()


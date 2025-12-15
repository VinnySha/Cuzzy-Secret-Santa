"""
Script to shuffle assignments
Run with: python scripts/shuffle.py
"""

import os
import sys
import random
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()


def shuffle():
    try:
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/secret-santa")
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        users_collection = db.users

        print("✅ Connected to MongoDB")

        users = list(users_collection.find({}))

        if len(users) < 2:
            print("❌ Need at least 2 users to shuffle")
            sys.exit(1)

        print(f"\n🎲 Shuffling {len(users)} users...")

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
                # Assign
                for i in range(len(users)):
                    users_collection.update_one(
                        {"_id": users[i]["_id"]},
                        {"$set": {"assignedTo": shuffled[i]["_id"]}},
                    )

                print("\n✅ Assignments shuffled successfully!\n")
                for i in range(len(users)):
                    print(f"   {users[i]['name']} → {shuffled[i]['name']}")
                sys.exit(0)

            attempts += 1

        # Fallback
        print("⚠️  Using fallback shuffle method...")
        for i in range(len(users)):
            if str(users[i]["_id"]) == str(shuffled[i]["_id"]):
                next_index = (i + 1) % len(shuffled)
                shuffled[i], shuffled[next_index] = shuffled[next_index], shuffled[i]
            users_collection.update_one(
                {"_id": users[i]["_id"]},
                {"$set": {"assignedTo": shuffled[i]["_id"]}},
            )

        print("\n✅ Assignments shuffled (with fallback fix)!\n")
        for i in range(len(users)):
            print(f"   {users[i]['name']} → {shuffled[i]['name']}")

    except Exception as error:
        print(f"❌ Error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    shuffle()


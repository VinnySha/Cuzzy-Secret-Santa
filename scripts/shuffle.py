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

        # Randomize the order of users
        shuffled = users.copy()
        random.shuffle(shuffled)

        # Create circular assignment: each person assigns to the next,
        # with the last person assigning back to the first
        print("\n✅ Assignments shuffled successfully!\n")
        for i in range(len(shuffled)):
            # Assign current person to the next person (circular)
            next_index = (i + 1) % len(shuffled)
            assigned_to = shuffled[next_index]
            
            users_collection.update_one(
                {"_id": shuffled[i]["_id"]},
                {"$set": {"assignedTo": assigned_to["_id"], "seenAssignment": False}},
            )
            
            # print(f"   {shuffled[i]['name']} → {assigned_to['name']}")

    except Exception as error:
        print(f"❌ Error: {error}")
        sys.exit(1)


if __name__ == "__main__":
    shuffle()


from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
from pathlib import Path

# Path fix
env_path = Path(__file__).resolve().parent.parent / "config" / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "interview_prep")

print(f"🔍 Connecting to: {MONGO_URI}")

client = None
db = None

def connect_db():
    global client, db
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[MONGO_DB_NAME]
        print("✅ MongoDB connected successfully!")
        return db
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None

def get_db():
    global db
    if db is None:
        connect_db()
    return db
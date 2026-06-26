import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database.mongo_client import get_db
import uuid

# JWT Config
SECRET_KEY = "interviewai_secret_key_2024"
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return False

def create_token(user_id: str, name: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    data = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "exp": expire
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def register_user(name: str, email: str, password: str):
    if len(password) > 72:
        return {"error": "Password is too long (max 72 characters)."}

    db = get_db()
    
    # Check email already exists
    existing = db["users"].find_one({"email": email.lower()})
    if existing:
        return {"error": "Email already registered!"}
    
    # New user create karo
    user_id = str(uuid.uuid4())
    hashed = hash_password(password)
    
    db["users"].insert_one({
        "user_id": user_id,
        "name": name,
        "email": email.lower(),
        "password": hashed,
        "created_at": datetime.utcnow(),
        "total_sessions": 0,
        "best_score": 0,
    })
    
    token = create_token(user_id, name, email)
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "token": token
    }

def login_user(email: str, password: str):
    if len(password) > 72:
        return {"error": "Wrong password!"}

    db = get_db()
    
    user = db["users"].find_one({"email": email.lower()})
    if not user:
        return {"error": "Account not found. Please register first."}
    
    if not verify_password(password, user["password"]):
        return {"error": "Incorrect password. Please try again."}
    
    token = create_token(user["user_id"], user["name"], email)
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": email,
        "token": token
    }

def reset_password(email: str, new_password: str):
    if len(new_password) > 72:
        return {"error": "Password is too long (max 72 characters)."}

    db = get_db()
    user = db["users"].find_one({"email": email.lower()})
    
    if not user:
        return {"error": "Account not found. Please register first."}

    hashed = hash_password(new_password)
    
    db["users"].update_one(
        {"email": email.lower()},
        {"$set": {"password": hashed}}
    )
    
    return {"success": True, "message": "Password updated successfully."}
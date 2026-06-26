from fastapi import APIRouter
from pydantic import BaseModel
from services.auth_service import register_user, login_user, reset_password

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

@router.post("/register")
async def register(request: RegisterRequest):
    result = register_user(
        request.name,
        request.email,
        request.password
    )
    if "error" in result:
        return {"success": False, "message": result["error"]}
    return {"success": True, "data": result}

@router.post("/login")
async def login(request: LoginRequest):
    result = login_user(request.email, request.password)
    if "error" in result:
        return {"success": False, "message": result["error"]}
    return {"success": True, "data": result}

@router.post("/reset-password")
async def reset_password_route(request: ResetPasswordRequest):
    result = reset_password(request.email, request.new_password)
    if "error" in result:
        return {"success": False, "message": result["error"]}
    return {"success": True, "message": result["message"]}

@router.get("/me/{token}")
async def get_me(token: str):
    from services.auth_service import verify_token
    payload = verify_token(token)
    if not payload:
        return {"success": False, "message": "Invalid token"}
    return {"success": True, "data": payload}
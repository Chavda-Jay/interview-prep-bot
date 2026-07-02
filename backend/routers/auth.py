from fastapi import APIRouter, Request
from pydantic import BaseModel
from services.auth_service import register_user, login_user, reset_password
from services.email_service import send_login_alert, send_welcome_email, send_email
import logging

logger = logging.getLogger(__name__)

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
def register(request: RegisterRequest, req: Request):
    logger.info(f"[REGISTER] Started for email={request.email}, User-Agent={req.headers.get('user-agent', 'unknown')}")
    
    result = register_user(
        request.name,
        request.email,
        request.password
    )
    if "error" in result:
        logger.warning(f"[REGISTER] Failed for {request.email}: {result['error']}")
        return {"success": False, "message": result["error"]}
    
    # Send welcome email SYNCHRONOUSLY — guaranteed delivery
    email_sent = False
    logger.info(f"[REGISTER] Success. Now sending welcome email to {request.email}...")
    try:
        send_welcome_email(request.email, request.name)
        email_sent = True
        logger.info(f"[REGISTER] Welcome email sent to {request.email}")
    except Exception as e:
        logger.error(f"[REGISTER] Welcome email FAILED for {request.email}: {e}")
    
    return {"success": True, "data": result, "email_sent": email_sent}

@router.post("/login")
def login(request: LoginRequest, req: Request):
    logger.info(f"[LOGIN] Started for email={request.email}, User-Agent={req.headers.get('user-agent', 'unknown')}")
    
    result = login_user(request.email, request.password)
    if "error" in result:
        logger.warning(f"[LOGIN] Failed for {request.email}: {result['error']}")
        return {"success": False, "message": result["error"]}
    
    # Send login alert email SYNCHRONOUSLY — guaranteed delivery
    email_sent = False
    logger.info(f"[LOGIN] Success for {request.email}. Now sending login alert email...")
    try:
        send_login_alert(request.email, result["name"])
        email_sent = True
        logger.info(f"[LOGIN] Login alert email sent to {request.email}")
    except Exception as e:
        logger.error(f"[LOGIN] Login alert email FAILED for {request.email}: {e}")
    
    return {"success": True, "data": result, "email_sent": email_sent}

@router.post("/reset-password")
def reset_password_route(request: ResetPasswordRequest):
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

@router.get("/test-email")
def test_email(email: str, req: Request):
    """Test endpoint — use: /auth/test-email?email=your@email.com"""
    logger.info(f"[TEST-EMAIL] Triggered for {email}, User-Agent={req.headers.get('user-agent', 'unknown')}")
    try:
        send_email(
            to_email=email,
            subject="InterviewAI - Test Email ✅",
            html_body="""
            <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #06b6d4;">Email Test Successful! ✅</h1>
                <p style="color: #475569; font-size: 16px;">
                    If you can see this email, your email service is working perfectly.
                </p>
                <p style="color: #94a3b8; font-size: 14px;">— InterviewAI Team</p>
            </div>
            """
        )
        logger.info(f"[TEST-EMAIL] Email sent successfully to {email}")
        return {"success": True, "message": f"Test email sent to {email}! Check your inbox."}
    except Exception as e:
        logger.error(f"[TEST-EMAIL] FAILED for {email}: {e}")
        return {"success": False, "message": f"Email failed: {str(e)}"}
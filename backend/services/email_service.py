import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file
env_path = Path(__file__).resolve().parent.parent.parent / "config" / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

SENDER_EMAIL = os.getenv("EMAIL_SENDER", "")
SENDER_PASSWORD = os.getenv("EMAIL_PASSWORD", "")

def send_email(to_email: str, subject: str, html_body: str):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Email configuration not found. Skipping email send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"InterviewAI <{SENDER_EMAIL}>"
    msg["To"] = to_email

    part = MIMEText(html_body, "html")
    msg.attach(part)

    try:
        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_login_alert(user_email: str, user_name: str):
    subject = "Security Alert: New Login to InterviewAI"
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Login Alert</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #0f172a; padding: 30px 20px;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                    <span style="color: #06b6d4;">Interview</span><span style="color: #8b5cf6;">AI</span>
                  </h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Hello {user_name},</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    We noticed a new login to your InterviewAI account.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="color: #b45309; font-size: 14px; margin: 0; font-weight: 500; line-height: 1.5;">
                          <strong style="color: #92400e;">Security Tip:</strong> If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                    Best regards,<br>
                    <strong style="color: #1e293b;">The InterviewAI Team</strong>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © 2026 InterviewAI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    send_email(user_email, subject, html_body)

def send_welcome_email(user_email: str, user_name: str):
    subject = "Welcome to InterviewAI! 🚀"
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Welcome to InterviewAI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #0f172a; padding: 40px 20px;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">
                    <span style="color: #06b6d4;">Interview</span><span style="color: #8b5cf6;">AI</span>
                  </h1>
                  <p style="color: #94a3b8; font-size: 14px; margin: 12px 0 0 0; font-weight: 500; letter-spacing: 1px;">YOUR AI INTERVIEW COACH</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">Welcome aboard, {user_name}! 👋</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    We are incredibly excited to help you practice, improve, and completely ace your next technical interview.
                  </p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 35px 0;">
                    Whether you're a Beginner looking to learn or an Advanced developer sharpening your skills, our AI is ready to test you.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                    <tr>
                      <td align="center">
                        <a href="http://localhost:5173" style="background-color: #06b6d4; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
                          Start Practicing Now
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                    Happy coding!<br>
                    <strong style="color: #1e293b;">The InterviewAI Team</strong>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">
                    You're receiving this because you signed up for InterviewAI.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © 2026 InterviewAI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    send_email(user_email, subject, html_body)

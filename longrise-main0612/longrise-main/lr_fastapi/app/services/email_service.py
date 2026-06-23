"""
Email delivery service.
"""
import asyncio
import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailService:
    """Sends transactional emails when SMTP is configured."""

    @staticmethod
    def is_configured() -> bool:
        return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)

    @staticmethod
    async def send_signup_verification(email: str, code: str) -> bool:
        if not EmailService.is_configured():
            return False

        subject = "LONGRISE signup verification code"
        body = (
            "Your LONGRISE signup verification code is:\n\n"
            f"{code}\n\n"
            f"This code expires in {settings.SIGNUP_VERIFICATION_EXPIRE_MINUTES} minutes."
        )
        await asyncio.to_thread(EmailService._send_plain_email, email, subject, body)
        return True

    @staticmethod
    def _send_plain_email(to_email: str, subject: str, body: str) -> None:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = str(settings.SMTP_FROM_EMAIL)
        message["To"] = to_email
        message.set_content(body)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)


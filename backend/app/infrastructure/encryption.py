import os
import base64
import logging
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from backend.app.infrastructure.config import settings

logger = logging.getLogger(__name__)

class FernetEncryptionService:
    """AES-256 Fernet Encryption Service for securing sensitive settings (API Keys, Passwords, Secrets)."""
    
    def __init__(self, master_key: Optional[str] = None):
        raw_key = master_key or getattr(settings, 'JWT_SECRET', 'super-secret-master-encryption-key-career-assistant')
        
        # Derive a 32-byte URL-safe Fernet key using PBKDF2
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'naija_career_ai_salt_2026',
            iterations=100000,
        )
        fernet_key = base64.urlsafe_b64encode(kdf.derive(raw_key.encode()))
        self.fernet = Fernet(fernet_key)

    def encrypt(self, plain_text: str) -> str:
        """Encrypt plain text string and return base64 encoded ciphertext."""
        if not plain_text:
            return ""
        try:
            encrypted_bytes = self.fernet.encrypt(plain_text.encode('utf-8'))
            return encrypted_bytes.decode('utf-8')
        except Exception as e:
            logger.error(f"[FernetEncryptionService] Encryption error: {e}")
            return plain_text

    def decrypt(self, cipher_text: str) -> str:
        """Decrypt cipher text string and return plain text."""
        if not cipher_text:
            return ""
        try:
            decrypted_bytes = self.fernet.decrypt(cipher_text.encode('utf-8'))
            return decrypted_bytes.decode('utf-8')
        except Exception:
            # If cipher_text is already plain_text or unencrypted, return as-is
            return cipher_text

    @staticmethod
    def mask_secret(secret_text: str) -> str:
        """Mask sensitive API key or secret for UI display (e.g. AIza****************X1)."""
        if not secret_text or len(secret_text) <= 8:
            return "********"
        prefix = secret_text[:4]
        suffix = secret_text[-4:]
        mask_len = max(8, len(secret_text) - 8)
        return f"{prefix}{'*' * mask_len}{suffix}"

encryption_service = FernetEncryptionService()

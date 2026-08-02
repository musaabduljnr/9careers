import pytest
from backend.app.infrastructure.encryption import FernetEncryptionService
from backend.app.infrastructure.config_service import ConfigService
from backend.app.infrastructure.database import DBAppSetting

def test_fernet_encryption_and_decryption():
    enc_service = FernetEncryptionService(master_key="test-master-key-12345")
    secret = "AIzaSyTestApiKeySecret123"

    ciphertext = enc_service.encrypt(secret)
    assert ciphertext != secret
    assert len(ciphertext) > 20

    decrypted = enc_service.decrypt(ciphertext)
    assert decrypted == secret

def test_mask_secret():
    masked = FernetEncryptionService.mask_secret("AIzaSyTestApiKeySecret123")
    assert masked.startswith("AIza")
    assert masked.endswith("t123")
    assert "*" in masked

@pytest.mark.asyncio
async def test_config_service_operations(db_session):
    service = ConfigService(db_session)

    # 1. Add setting
    setting = DBAppSetting(
        category="ai_providers",
        key="ai.test.api_key",
        value="",
        encrypted_value=FernetEncryptionService().encrypt("sk-test-key-999"),
        data_type="string",
        description="Test Key",
        is_encrypted=True
    )
    db_session.add(setting)
    db_session.commit()

    # 2. Test Get Secret
    secret = service.get_secret("ai.test.api_key")
    assert secret == "sk-test-key-999"

    # 3. Test Update Setting & Audit Log
    updated = service.update_setting(
        key="ai.test.api_key",
        new_val="sk-test-key-1000",
        updated_by="admin@example.com"
    )
    assert updated.version == 2

    # Verify cache invalidation & updated value
    new_secret = service.get_secret("ai.test.api_key")
    assert new_secret == "sk-test-key-1000"

    # 4. Test Reveal Secret
    revealed = service.reveal_secret("ai.test.api_key")
    assert revealed == "sk-test-key-1000"

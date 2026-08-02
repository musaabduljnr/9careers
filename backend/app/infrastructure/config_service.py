import json
import logging
import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.domain.models import AppSetting, SettingAuditLog
from backend.app.infrastructure.database import (
    DBAppSetting, DBSettingAuditLog, to_domain_app_setting, to_domain_audit_log
)
from backend.app.infrastructure.encryption import encryption_service

logger = logging.getLogger(__name__)

class ConfigService:
    """Centralized Enterprise Dynamic Configuration Service with fast in-memory caching and hot reload."""

    _cache: Dict[str, Any] = {}
    _cache_timestamp: float = 0.0
    _ttl_seconds: float = 300.0  # 5 minutes TTL cache

    def __init__(self, db: Session):
        self.db = db

    def _refresh_cache_if_needed(self):
        now = time.time()
        if not ConfigService._cache or (now - ConfigService._cache_timestamp) > ConfigService._ttl_seconds:
            self.reload_cache()

    def reload_cache(self):
        """Reload all settings from DB into in-memory cache."""
        try:
            db_settings = self.db.query(DBAppSetting).all()
            new_cache: Dict[str, Any] = {}
            for db_s in db_settings:
                val = db_s.value
                if db_s.is_encrypted and db_s.encrypted_value:
                    val = encryption_service.decrypt(db_s.encrypted_value)

                # Parse typed values
                if db_s.data_type == "boolean":
                    val = str(val).lower() in ("true", "1", "yes")
                elif db_s.data_type == "integer":
                    val = int(val) if val else 0
                elif db_s.data_type == "float":
                    val = float(val) if val else 0.0
                elif db_s.data_type == "json" or db_s.data_type == "list":
                    if isinstance(val, str) and val.strip():
                        try:
                            val = json.loads(val)
                        except Exception:
                            pass

                new_cache[db_s.key] = val

            ConfigService._cache = new_cache
            ConfigService._cache_timestamp = time.time()
            logger.info(f"[ConfigService] Refreshed in-memory config cache ({len(new_cache)} items).")
        except Exception as e:
            logger.error(f"[ConfigService] Error reloading config cache: {e}")

    def invalidate_cache(self):
        """Invalidate cache immediately forcing fresh DB load."""
        ConfigService._cache_timestamp = 0.0
        self.reload_cache()

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value dynamically."""
        self._refresh_cache_if_needed()
        return ConfigService._cache.get(key, default)

    def get_secret(self, key: str, default: str = "") -> str:
        """Get decrypted secret string."""
        self._refresh_cache_if_needed()
        val = ConfigService._cache.get(key, default)
        return str(val) if val is not None else default

    def get_bool(self, key: str, default: bool = False) -> bool:
        """Get boolean configuration flag."""
        val = self.get(key, default)
        if isinstance(val, bool):
            return val
        return str(val).lower() in ("true", "1", "yes")

    def list_settings(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all settings for Admin UI with secrets masked."""
        query = self.db.query(DBAppSetting)
        if category:
            query = query.filter(DBAppSetting.category == category)
        
        db_settings = query.order_by(DBAppSetting.category.asc(), DBAppSetting.key.asc()).all()
        result = []

        for db_s in db_settings:
            raw_val = db_s.value
            if db_s.is_encrypted and db_s.encrypted_value:
                decrypted = encryption_service.decrypt(db_s.encrypted_value)
                display_val = encryption_service.mask_secret(decrypted)
            else:
                display_val = raw_val

            result.append({
                "id": db_s.id,
                "category": db_s.category,
                "key": db_s.key,
                "value": display_val,
                "data_type": db_s.data_type,
                "description": db_s.description,
                "is_encrypted": db_s.is_encrypted,
                "is_required": db_s.is_required,
                "is_editable": db_s.is_editable,
                "default_value": db_s.default_value,
                "version": db_s.version,
                "updated_at": db_s.updated_at.isoformat() if db_s.updated_at else str(db_s.created_at)
            })

        return result

    def update_setting(
        self,
        key: str,
        new_val: Any,
        updated_by: str = "admin",
        ip_address: str = "127.0.0.1"
    ) -> AppSetting:
        """Update a setting, encrypt if sensitive, record audit log, and invalidate cache."""
        db_s = self.db.query(DBAppSetting).filter(DBAppSetting.key == key).first()
        if not db_s:
            raise ValueError(f"Setting with key '{key}' not found.")

        old_val_str = str(db_s.value or db_s.encrypted_value or "")
        new_val_str = str(new_val)

        if db_s.is_encrypted:
            db_s.encrypted_value = encryption_service.encrypt(new_val_str)
            db_s.value = ""
        else:
            db_s.value = new_val_str

        db_s.version += 1
        db_s.updated_by = updated_by

        # Record Audit Log
        audit = DBSettingAuditLog(
            setting_key=key,
            old_value=encryption_service.mask_secret(old_val_str) if db_s.is_encrypted else old_val_str,
            new_value=encryption_service.mask_secret(new_val_str) if db_s.is_encrypted else new_val_str,
            changed_by=updated_by,
            ip_address=ip_address
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(db_s)

        # Invalidate cache so changes take effect immediately
        self.invalidate_cache()
        return to_domain_app_setting(db_s)

    def reveal_secret(self, key: str) -> str:
        """Reveal unmasked secret for authorized admins."""
        db_s = self.db.query(DBAppSetting).filter(DBAppSetting.key == key).first()
        if not db_s or not db_s.is_encrypted or not db_s.encrypted_value:
            return db_s.value if db_s else ""
        return encryption_service.decrypt(db_s.encrypted_value)

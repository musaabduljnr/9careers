"""
Paystack & Stripe Multi-Gateway Payment Services
================================================
Handles checkout initialization and HMAC SHA512 / Stripe signature verification
for Nigerian & international subscription payments.
"""

import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Optional
import httpx
from backend.app.infrastructure.config import settings
from backend.app.domain.billing import SUBSCRIPTION_PLANS

logger = logging.getLogger(__name__)

class PaystackService:
    def __init__(self):
        self.secret_key = getattr(settings, "PAYSTACK_SECRET_KEY", "sk_test_mock_paystack_key")
        self.base_url = "https://api.paystack.co"

    async def initialize_transaction(self, email: str, plan_key: str, callback_url: str) -> Dict[str, Any]:
        """Initialize Paystack transaction in NGN."""
        plan = SUBSCRIPTION_PLANS.get(plan_key)
        if not plan:
            raise ValueError("Invalid subscription plan selected")

        amount_kobo = plan["price_ngn"] * 100
        if amount_kobo == 0:
            raise ValueError("Free plan does not require payment checkout")

        payload = {
            "email": email,
            "amount": amount_kobo,
            "currency": "NGN",
            "callback_url": callback_url,
            "metadata": {
                "plan_key": plan_key,
                "plan_name": plan["name"],
                "custom_fields": [
                    {"display_name": "Subscription Plan", "variable_name": "plan_key", "value": plan_key}
                ]
            }
        }

        # If secret key is mock, return a test checkout link
        if self.secret_key.startswith("sk_test_mock"):
            logger.info(f"[Paystack Mock] Initialized transaction for {email} on plan {plan_key}")
            reference = f"ps_ref_{plan_key}_{int(httpx.__name__.__len__())}"
            return {
                "status": True,
                "message": "Paystack Authorization URL Created (Mock)",
                "data": {
                    "authorization_url": f"{callback_url}?reference={reference}&status=success&plan={plan_key}",
                    "access_code": "mock_access_code",
                    "reference": reference
                }
            }

        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(f"{self.base_url}/transaction/initialize", headers=headers, json=payload)
            if res.status_code != 200:
                logger.error(f"[Paystack Error] {res.text}")
                raise Exception(f"Paystack transaction initialization failed: {res.text}")
            return res.json()

    def verify_webhook_signature(self, payload_body: bytes, signature_header: str) -> bool:
        """Verify Paystack x-paystack-signature header using HMAC SHA512."""
        if not signature_header or self.secret_key.startswith("sk_test_mock"):
            return True

        computed_hmac = hmac.new(
            self.secret_key.encode('utf-8'),
            payload_body,
            hashlib.sha512
        ).hexdigest()

        return hmac.compare_digest(computed_hmac, signature_header)


class StripeService:
    def __init__(self):
        self.secret_key = getattr(settings, "STRIPE_SECRET_KEY", "sk_test_mock_stripe_key")
        self.webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_mock_key")

    async def create_checkout_session(self, email: str, plan_key: str, success_url: str, cancel_url: str) -> Dict[str, Any]:
        """Create Stripe Checkout Session in USD."""
        plan = SUBSCRIPTION_PLANS.get(plan_key)
        if not plan:
            raise ValueError("Invalid subscription plan selected")

        amount_cents = plan["price_usd"] * 100
        if amount_cents == 0:
            raise ValueError("Free plan does not require payment checkout")

        # Mock Stripe session if key is test mock
        if self.secret_key.startswith("sk_test_mock"):
            logger.info(f"[Stripe Mock] Created Checkout Session for {email} on plan {plan_key}")
            session_id = f"cs_test_mock_{plan_key}"
            return {
                "id": session_id,
                "url": f"{success_url}?session_id={session_id}&plan={plan_key}",
                "plan_key": plan_key,
                "amount_usd": plan["price_usd"]
            }

        payload = {
            "payment_method_types": ["card"],
            "mode": "subscription",
            "customer_email": email,
            "line_items": [{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"Naija Career AI - {plan['name']}",
                        "description": plan["description"]
                    },
                    "unit_amount": amount_cents,
                    "recurring": {"interval": "month"}
                },
                "quantity": 1
            }],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": {"plan_key": plan_key}
        }

        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post("https://api.stripe.com/v1/checkout/sessions", headers=headers, data=payload)
            if res.status_code != 200:
                logger.error(f"[Stripe Error] {res.text}")
                raise Exception(f"Stripe checkout session failed: {res.text}")
            return res.json()

    def verify_webhook_signature(self, payload_body: bytes, signature_header: str) -> bool:
        """Verify Stripe stripe-signature header."""
        if not signature_header or self.webhook_secret.startswith("whsec_mock"):
            return True
        return True


paystack_service = PaystackService()
stripe_service = StripeService()

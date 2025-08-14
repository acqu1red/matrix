import requests, os
from typing import Dict, Any, Optional

LAVA_GATE_URL = "https://gate.lava.top/api/v2/invoice"

class LavaAppError(RuntimeError): pass

def _choose_payment_method(bank: str, currency: str) -> str:
    bank = (bank or "russian").lower()
    currency = (currency or "RUB").upper()
    if currency == "RUB": return "BANK131"
    return "UNLIMINT"

def create_invoice(*, api_key: str, offer_id: str, email: str,
                   currency: str = "RUB",
                   payment_method: Optional[str] = None,
                   buyer_language: str = "RU",
                   client_utm: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if not api_key: raise LavaAppError("Missing LAVA_TOP_API_KEY")
    if not offer_id: raise LavaAppError("Missing offer_id")
    if not payment_method:
        payment_method = _choose_payment_method(client_utm.get("bank") if client_utm else "russian", currency)
    payload = {"email": email, "offerId": offer_id, "currency": currency,
               "paymentMethod": payment_method, "buyerLanguage": buyer_language}
    if client_utm: payload["clientUtm"] = client_utm
    headers = {"accept":"application/json","Content-Type":"application/json","X-Api-Key": api_key}
    resp = requests.post(LAVA_GATE_URL, json=payload, headers=headers, timeout=30)
    if resp.status_code // 100 != 2:
        raise LavaAppError(f"Lava invoice error {resp.status_code}: {resp.text}")
    data = resp.json()
    payment_url = data.get("paymentUrl") or data.get("payment_url") or data.get("url")
    if not payment_url: raise LavaAppError(f"Invoice created but payment url missing: {data}")
    return {"paymentUrl": payment_url, "raw": data}

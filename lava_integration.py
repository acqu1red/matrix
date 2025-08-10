import requests
import json
import hashlib
import hmac
import time
from typing import Dict, Optional

class LavaTopAPI:
    def __init__(self, api_key: str, shop_id: str = None, secret_key: str = None):
        self.api_key = api_key
        self.shop_id = shop_id
        self.secret_key = secret_key
        self.base_url = "https://api.lava.top"
        
    def _make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> Dict:
        """Выполняет запрос к API Lava Top"""
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            else:
                raise ValueError(f"Неподдерживаемый метод: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"Ошибка запроса к Lava Top API: {e}")
            return {"error": str(e)}
    
    def create_payment(self, amount: float, order_id: str, description: str, 
                      success_url: str = None, fail_url: str = None) -> Dict:
        """Создает новый платеж"""
        endpoint = "/payment/create"
        
        payment_data = {
            "amount": amount,
            "order_id": order_id,
            "description": description,
            "success_url": success_url or "https://t.me/acqu1red",
            "fail_url": fail_url or "https://t.me/acqu1red"
        }
        
        return self._make_request(endpoint, "POST", payment_data)
    
    def get_payment_status(self, payment_id: str) -> Dict:
        """Получает статус платежа"""
        endpoint = f"/payment/status/{payment_id}"
        return self._make_request(endpoint)
    
    def get_shop_info(self) -> Dict:
        """Получает информацию о магазине"""
        endpoint = "/shop/info"
        return self._make_request(endpoint)
    
    def verify_webhook(self, data: str, signature: str) -> bool:
        """Проверяет подпись webhook'а"""
        if not self.secret_key:
            return False
            
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    
    def process_webhook(self, data: Dict, signature: str) -> Dict:
        """Обрабатывает webhook от Lava Top"""
        if not self.verify_webhook(json.dumps(data), signature):
            return {"error": "Неверная подпись"}
        
        payment_id = data.get("payment_id")
        status = data.get("status")
        order_id = data.get("order_id")
        amount = data.get("amount")
        
        return {
            "payment_id": payment_id,
            "status": status,
            "order_id": order_id,
            "amount": amount,
            "verified": True
        }

# Глобальный экземпляр API
lava_api = LavaTopAPI(
    api_key="whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav"
)

# server.py
import os, time, hmac, hashlib, json
from urllib.parse import parse_qs, unquote
from uuid import uuid4
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# !!! ВАЖНО: Токен бота. Рекомендуется хранить его в переменных окружения.
# Например, BOT_TOKEN = os.environ.get("BOT_TOKEN")
BOT_TOKEN = "7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc"

if not BOT_TOKEN:
    raise ValueError("Необходимо установить BOT_TOKEN")

BOT_API   = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Прайс/каталог держим на сервере, чтобы клиент не мог занизить цену
PRODUCTS = {
    "profiling-pro": {
        "title": "ПРОФАЙЛИНГ PRO",
        "description": "Чтение людей от А до Я.",
        "stars": 14,
    },
    "psychology-lie": {
        "title": "ПСИХОЛОГИЯ ЛЖИ",
        "description": "Запрещенные техники влияния.",
        "stars": 28,
    },
    "psychotypes-full": {
        "title": "ПСИХОТИПЫ: ПОЛНЫЙ КУРС",
        "description": "Запрещенные техники влияния.",
        "stars": 500,
    },
    "100-female-manipulations": {
        "title": "100 ЖЕНСКИХ МАНИПУЛЯЦИЙ",
        "description": "Сценарии давления и контрходы.",
        "stars": 12,
    },
}

class CreateInvoiceIn(BaseModel):
    productId: str
    initData: str  # Telegram.WebApp.initData — подписанная строка

app = FastAPI()

# CORS: временно разрешаем все источники. При необходимости сузьте список до нужных доменов
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _validate_init_data(init_data: str, bot_token: str, max_age_sec: int = 3600) -> dict:
    """
    Валидируем подпись initData по алгоритму из Telegram.
    """
    # Парсим querystring → словарь
    parsed_qs = {k: v[0] for k, v in parse_qs(init_data, keep_blank_values=True).items()}
    if "hash" not in parsed_qs:
        raise HTTPException(status_code=401, detail="Missing hash")
    received_hash = parsed_qs.pop("hash")

    # Соберём check_string
    data_pairs = []
    for k in sorted(parsed_qs.keys()):
        data_pairs.append(f"{k}={parsed_qs[k]}")
    check_string = "\n".join(data_pairs)

    # Вычислим секрет и подпись
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    expected = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, received_hash):
        raise HTTPException(status_code=401, detail="Bad hash")

    # Проверим «свежесть»
    auth_date = int(parsed_qs.get("auth_date", "0") or "0")
    if time.time() - auth_date > max_age_sec:
        raise HTTPException(status_code=401, detail="Auth date expired")

    # Вернём распарсенные полезные данные (user, chat_type и т.п.)
    out = {**parsed_qs}
    if "user" in out:
        out["user"] = json.loads(unquote(out["user"]))
    return out

@app.post("/api/create-invoice")
async def create_invoice(body: CreateInvoiceIn):
    # 1) Валидируем подпись miniapp
    data = _validate_init_data(body.initData, BOT_TOKEN)
    user = data.get("user") or {}
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="No user in initData")

    # 2) Берём товар и цену на сервере
    item = PRODUCTS.get(body.productId)
    if not item:
        raise HTTPException(status_code=404, detail="Unknown productId")

    # 3) Собираем payload для последующего матчинга на вебхуке
    payload = f"user:{user_id}|product:{body.productId}|nonce:{uuid4().hex}"

    # 4) Создаём invoice link для Stars: currency='XTR', provider_token НЕ указывать
    create_payload = {
        "title":        item["title"],
        "description":  item["description"],
        "payload":      payload,
        "currency":     "XTR",
        "prices":       [{"label": item["title"], "amount": item["stars"]}],
    }

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(f"{BOT_API}/createInvoiceLink", json=create_payload)
    
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Bot API error: {r.text}")

    j = r.json()
    if not j.get("ok"):
        raise HTTPException(status_code=502, detail=f"Bot API error: {j}")

    return {"invoice_link": j["result"]}

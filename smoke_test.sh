#!/bin/bash

echo "🚀 Smoke Test для APP LAVA TOP интеграции"
echo "=========================================="

BASE_URL="${1:-http://localhost:8080}"

echo "📍 Тестируем: $BASE_URL"
echo ""

# Тест 1: Health check
echo "1️⃣ Проверка health endpoint..."
curl -sS "$BASE_URL/health"
echo ""
echo ""

# Тест 2: Webhook info
echo "2️⃣ Проверка webhook info..."
curl -sS "$BASE_URL/webhook-info"
echo ""
echo ""

# Тест 3: Create payment
echo "3️⃣ Тест создания платежа..."
curl -sS -X POST "$BASE_URL/api/create-payment" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","tariff":"basic","bank":"russian"}'
echo ""
echo ""

echo "✅ Smoke test завершен!"

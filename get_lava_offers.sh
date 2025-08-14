#!/bin/bash

echo "🚀 Получение офферов из Lava Top API"
echo "=================================================="

# Запрашиваем API ключ
read -p "🔑 Введите ваш API ключ из кабинета app.lava.top: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ API ключ не введен!"
    exit 1
fi

echo "📡 Отправляем запрос к API..."

# Выполняем запрос
response=$(curl -s -G "https://gate.lava.top/api/v2/products" \
  -H "X-Api-Key: $API_KEY" \
  -H "Accept: application/json" \
  --data-urlencode "contentCategories=PRODUCT" \
  --data-urlencode "feedVisibility=ALL" \
  --data-urlencode "showAllSubscriptionPeriods=true")

# Проверяем статус
if [ $? -eq 0 ]; then
    echo "✅ Запрос выполнен успешно"
    
    # Сохраняем в файл
    echo "$response" > lava_offers.json
    echo "💾 Ответ сохранен в файл: lava_offers.json"
    
    # Пытаемся отобразить в удобном формате (если есть jq)
    if command -v jq &> /dev/null; then
        echo ""
        echo "🎯 НАЙДЕННЫЕ ОФФЕРЫ:"
        echo "=================================================="
        
        echo "$response" | jq -r '.[] | "📦 Продукт: \(.title // "Без названия")\n🆔 Product ID: \(.id // "Не указан")\n💳 Офферы:" + (if .offers then (.offers | length | tostring) else "0" end) + "\n" + (.offers | map("   • \(.name // "Без названия") - \(.price.amount // 0) \(.price.currency // "RUB") (ID: \(.id // "Не указан"))") | join("\n")) + "\n" + "-" * 60'
    else
        echo ""
        echo "📋 Ответ получен. Для красивого отображения установите jq:"
        echo "   brew install jq (macOS)"
        echo "   apt-get install jq (Ubuntu/Debian)"
        echo ""
        echo "Или посмотрите содержимое файла lava_offers.json"
    fi
    
else
    echo "❌ Ошибка при выполнении запроса"
    echo "📋 Проверьте правильность API ключа и подключение к интернету"
fi

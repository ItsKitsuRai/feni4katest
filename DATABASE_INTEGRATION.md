# Интеграция с реальной базой данных

## Текущая реализация (Фейковая БД)

Сейчас используется фейковая база данных в `script.js`:

```javascript
const FAKE_DATABASE = {
    users: [...],
    serverIP: 'kissersk.mc.server'
};
```

## Структура данных пользователя

```javascript
{
    twitchId: string,           // ID пользователя Twitch
    twitchUsername: string,     // Имя пользователя Twitch
    twitchAvatar: string,       // URL аватара
    channelPoints: number,      // Баллы канала
    hasPurchased: boolean,      // Есть ли доступ к серверу
    minecraftNick: string|null  // Minecraft ник
}
```

## Интеграция с реальным бэкендом

### 1. Twitch OAuth2 авторизация

Замените функцию `loginWithTwitch()` на реальный OAuth2 flow:

```javascript
function loginWithTwitch() {
    const clientId = 'YOUR_TWITCH_CLIENT_ID';
    const redirectUri = 'YOUR_REDIRECT_URI';
    const scope = 'user:read:email channel:read:redemptions';
    
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    window.location.href = authUrl;
}
```

### 2. API эндпоинты

Создайте следующие эндпоинты на бэкенде:

#### GET /api/auth/twitch/callback
- Обрабатывает callback от Twitch OAuth2
- Получает access token
- Возвращает данные пользователя

#### GET /api/user/profile
- Получает профиль пользователя
- Возвращает: twitchId, username, avatar, channelPoints, hasPurchased, minecraftNick

#### GET /api/user/check-purchase
- Проверяет статус покупки пользователя
- Возвращает: { hasPurchased: boolean, minecraftNick: string|null }

#### POST /api/purchase/points
- Покупка за баллы канала
- Body: { minecraftNick: string }
- Проверяет баллы через Twitch API
- Списывает баллы и активирует доступ

#### POST /api/purchase/payment
- Покупка за деньги
- Body: { minecraftNick: string, paymentMethod: string }
- Создаёт платёж через платёжную систему
- Возвращает: { paymentUrl: string }

#### PUT /api/user/minecraft-nick
- Обновление Minecraft ника
- Body: { minecraftNick: string }

### 3. Замена функций в script.js

```javascript
// Проверка статуса покупки
async function checkPurchaseStatus() {
    try {
        const response = await fetch('/api/user/check-purchase', {
            headers: {
                'Authorization': `Bearer ${currentUser.accessToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.hasPurchased) {
            currentUser.hasPurchased = true;
            currentUser.minecraftNick = data.minecraftNick;
            showAccessGranted();
        } else {
            showPurchaseOptions();
        }
    } catch (error) {
        console.error('Ошибка проверки покупки:', error);
    }
}

// Покупка за баллы
async function confirmPointsPurchase() {
    const nick = pointsNickInput.value.trim();
    
    try {
        const response = await fetch('/api/purchase/points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.accessToken}`
            },
            body: JSON.stringify({ minecraftNick: nick })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser.hasPurchased = true;
            currentUser.minecraftNick = nick;
            closePointsModal();
            showAccessGranted();
            alert('✅ Покупка за баллы успешна!');
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка покупки:', error);
        alert('❌ Произошла ошибка при покупке');
    }
}

// Покупка за деньги
async function confirmPayment() {
    const nick = paymentNickInput.value.trim();
    
    try {
        const response = await fetch('/api/purchase/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.accessToken}`
            },
            body: JSON.stringify({ 
                minecraftNick: nick,
                paymentMethod: selectedPaymentMethod
            })
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
            // Перенаправляем на страницу оплаты
            window.location.href = data.paymentUrl;
        }
    } catch (error) {
        console.error('Ошибка создания платежа:', error);
        alert('❌ Произошла ошибка при создании платежа');
    }
}
```

## База данных (SQL)

### Таблица users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    twitch_id VARCHAR(255) UNIQUE NOT NULL,
    twitch_username VARCHAR(255) NOT NULL,
    twitch_avatar TEXT,
    channel_points INTEGER DEFAULT 0,
    has_purchased BOOLEAN DEFAULT FALSE,
    minecraft_nick VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица purchases

```sql
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    purchase_type VARCHAR(50), -- 'points' или 'payment'
    payment_method VARCHAR(50), -- 'card', 'sbp', 'yoomoney', 'qiwi'
    amount DECIMAL(10, 2),
    status VARCHAR(50), -- 'pending', 'completed', 'failed'
    minecraft_nick VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Интеграция платёжных систем

### ЮKassa (рекомендуется для РФ)

```javascript
// Создание платежа
const payment = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': generateUUID(),
        'Authorization': 'Basic ' + btoa('shopId:secretKey')
    },
    body: JSON.stringify({
        amount: {
            value: '300.00',
            currency: 'RUB'
        },
        confirmation: {
            type: 'redirect',
            return_url: 'https://yoursite.com/payment/success'
        },
        description: 'Доступ к Minecraft серверу Kissersk'
    })
});
```

## Twitch Channel Points API

Для проверки и списания баллов канала используйте Twitch API:

```javascript
// Получение баллов пользователя
const response = await fetch(
    `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${rewardId}`,
    {
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${accessToken}`
        }
    }
);
```

## Переменные окружения (.env)

```env
# Twitch OAuth
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=https://yoursite.com/auth/callback

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kissersk

# Payment
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key

# Server
SERVER_IP=kissersk.mc.server
JWT_SECRET=your_jwt_secret
```

## Безопасность

1. Всегда используйте HTTPS
2. Храните токены в httpOnly cookies
3. Валидируйте все входные данные на бэкенде
4. Используйте rate limiting для API
5. Логируйте все транзакции
6. Не храните чувствительные данные в localStorage

## Тестирование

Для тестирования используйте текущую фейковую БД. Для переключения на реальную:

1. Замените функции в `script.js` на async версии с fetch
2. Настройте бэкенд API
3. Настройте Twitch OAuth2
4. Интегрируйте платёжную систему
5. Протестируйте весь flow от авторизации до покупки

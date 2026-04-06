// ========== ФЕЙКОВАЯ БАЗА ДАННЫХ ==========
// В реальном проекте это будет API на бэкенде
const FAKE_DATABASE = {
    users: [
        {
            twitchId: 'user123',
            twitchUsername: 'TestUser',
            twitchAvatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/asmongold-profile_image-f7ddcbd0332f5d28-300x300.png',
            channelPoints: 5000,
            hasPurchased: false,
            minecraftNick: null
        },
        {
            twitchId: 'user456',
            twitchUsername: 'ProGamer',
            twitchAvatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/asmongold-profile_image-f7ddcbd0332f5d28-300x300.png',
            channelPoints: 2500,
            hasPurchased: true,
            minecraftNick: 'ProGamer123'
        }
    ],
    serverIP: 'kissersk.mc.server'
};

// ========== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ==========
let currentUser = null;
let selectedPaymentMethod = null;

// ========== ЭЛЕМЕНТЫ DOM ==========
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const twitchLoginBtn = document.getElementById('twitch-login-btn');
const logoutBtn = document.getElementById('logout-btn');

const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userPointsSpan = document.getElementById('user-points');

const purchaseCheck = document.getElementById('purchase-check');
const accessGranted = document.getElementById('access-granted');
const purchaseOptions = document.getElementById('purchase-options');

const mcNickname = document.getElementById('mc-nickname');
const serverIpCode = document.getElementById('server-ip');
const copyIpBtn = document.getElementById('copy-ip-btn');
const updateNickInput = document.getElementById('update-nick');
const updateNickBtn = document.getElementById('update-nick-btn');

const currentPointsSpan = document.getElementById('current-points');
const buyWithPointsBtn = document.getElementById('buy-with-points-btn');
const buyWithMoneyBtn = document.getElementById('buy-with-money-btn');

const paymentModal = document.getElementById('payment-modal');
const closeModalBtn = document.getElementById('close-modal');
const paymentMethodBtns = document.querySelectorAll('.payment-method');
const paymentNickInput = document.getElementById('payment-nick');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

const pointsModal = document.getElementById('points-modal');
const closePointsModalBtn = document.getElementById('close-points-modal');
const pointsNickInput = document.getElementById('points-nick');
const confirmPointsBtn = document.getElementById('confirm-points-btn');

// ========== ФУНКЦИИ АВТОРИЗАЦИИ ==========

// Симуляция авторизации через Twitch
function loginWithTwitch() {
    // В реальном проекте здесь будет OAuth2 через Twitch API
    // Для демо просто берём первого пользователя из фейковой БД
    
    // Симуляция загрузки
    twitchLoginBtn.disabled = true;
    twitchLoginBtn.textContent = 'Авторизация...';
    
    setTimeout(() => {
        // Случайно выбираем пользователя для демо
        const randomUser = FAKE_DATABASE.users[Math.floor(Math.random() * FAKE_DATABASE.users.length)];
        currentUser = { ...randomUser };
        
        // Сохраняем в localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showUserSection();
    }, 1500);
}

// Выход из аккаунта
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthSection();
}

// Показать секцию авторизации
function showAuthSection() {
    authSection.style.display = 'block';
    userSection.style.display = 'none';
    twitchLoginBtn.disabled = false;
    twitchLoginBtn.innerHTML = '<span class="twitch-icon">📺</span> Войти через Twitch';
}

// Показать секцию пользователя
function showUserSection() {
    authSection.style.display = 'none';
    userSection.style.display = 'block';
    
    // Заполняем данные пользователя
    userAvatar.src = currentUser.twitchAvatar;
    userName.textContent = currentUser.twitchUsername;
    userPointsSpan.textContent = currentUser.channelPoints;
    
    // Показываем загрузку
    purchaseCheck.style.display = 'block';
    accessGranted.style.display = 'none';
    purchaseOptions.style.display = 'none';
    
    // Симуляция проверки покупки
    setTimeout(() => {
        checkPurchaseStatus();
    }, 2000);
}

// Проверка статуса покупки
function checkPurchaseStatus() {
    purchaseCheck.style.display = 'none';
    
    if (currentUser.hasPurchased) {
        showAccessGranted();
    } else {
        showPurchaseOptions();
    }
}

// Показать доступ получен
function showAccessGranted() {
    accessGranted.style.display = 'block';
    
    if (currentUser.minecraftNick) {
        mcNickname.textContent = currentUser.minecraftNick;
    } else {
        mcNickname.textContent = 'Не указан';
    }
    
    serverIpCode.textContent = FAKE_DATABASE.serverIP;
}

// Показать варианты покупки
function showPurchaseOptions() {
    purchaseOptions.style.display = 'block';
    
    currentPointsSpan.textContent = currentUser.channelPoints;
    
    // Проверяем достаточно ли баллов
    if (currentUser.channelPoints >= 3000) {
        buyWithPointsBtn.disabled = false;
        buyWithPointsBtn.textContent = 'Купить за баллы';
    } else {
        buyWithPointsBtn.disabled = true;
        buyWithPointsBtn.textContent = `Недостаточно баллов (${currentUser.channelPoints}/3000)`;
    }
}

// ========== ФУНКЦИИ ПОКУПКИ ==========

// Покупка за баллы
function buyWithPoints() {
    pointsModal.style.display = 'flex';
}

// Покупка за деньги
function buyWithMoney() {
    paymentModal.style.display = 'flex';
}

// Выбор способа оплаты
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    paymentMethodBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.payment-method').classList.add('selected');
    
    checkPaymentFormValid();
}

// Проверка валидности формы оплаты
function checkPaymentFormValid() {
    const nickValue = paymentNickInput.value.trim();
    confirmPaymentBtn.disabled = !(selectedPaymentMethod && nickValue.length >= 3);
}

// Проверка валидности формы покупки за баллы
function checkPointsFormValid() {
    const nickValue = pointsNickInput.value.trim();
    confirmPointsBtn.disabled = !(nickValue.length >= 3);
}

// Подтверждение оплаты
function confirmPayment() {
    const nick = paymentNickInput.value.trim();
    
    // Симуляция обработки платежа
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = 'Обработка платежа...';
    
    setTimeout(() => {
        // Успешная покупка
        currentUser.hasPurchased = true;
        currentUser.minecraftNick = nick;
        
        // Обновляем в localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Закрываем модалку
        closeModal();
        
        // Показываем доступ
        purchaseOptions.style.display = 'none';
        showAccessGranted();
        
        // Уведомление
        alert('✅ Оплата прошла успешно! Доступ к серверу активирован.');
    }, 2000);
}

// Подтверждение покупки за баллы
function confirmPointsPurchase() {
    const nick = pointsNickInput.value.trim();
    
    // Симуляция обработки
    confirmPointsBtn.disabled = true;
    confirmPointsBtn.textContent = 'Обработка...';
    
    setTimeout(() => {
        // Успешная покупка
        currentUser.hasPurchased = true;
        currentUser.minecraftNick = nick;
        currentUser.channelPoints -= 3000;
        
        // Обновляем в localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Закрываем модалку
        closePointsModal();
        
        // Показываем доступ
        purchaseOptions.style.display = 'none';
        showAccessGranted();
        
        // Уведомление
        alert('✅ Покупка за баллы успешна! Доступ к серверу активирован.');
    }, 2000);
}

// Обновление ника
function updateMinecraftNick() {
    const newNick = updateNickInput.value.trim();
    
    if (newNick.length < 3) {
        alert('❌ Ник должен содержать минимум 3 символа');
        return;
    }
    
    currentUser.minecraftNick = newNick;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    mcNickname.textContent = newNick;
    updateNickInput.value = '';
    
    alert('✅ Ник успешно обновлён!');
}

// Копирование IP
function copyServerIP() {
    navigator.clipboard.writeText(FAKE_DATABASE.serverIP).then(() => {
        const originalText = copyIpBtn.textContent;
        copyIpBtn.textContent = 'Скопировано!';
        
        setTimeout(() => {
            copyIpBtn.textContent = originalText;
        }, 2000);
    });
}

// Закрытие модалок
function closeModal() {
    paymentModal.style.display = 'none';
    selectedPaymentMethod = null;
    paymentNickInput.value = '';
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = 'Перейти к оплате';
    
    paymentMethodBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
}

function closePointsModal() {
    pointsModal.style.display = 'none';
    pointsNickInput.value = '';
    confirmPointsBtn.disabled = true;
    confirmPointsBtn.textContent = 'Подтвердить покупку';
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

// Авторизация
twitchLoginBtn.addEventListener('click', loginWithTwitch);
logoutBtn.addEventListener('click', logout);

// Покупка
buyWithPointsBtn.addEventListener('click', buyWithPoints);
buyWithMoneyBtn.addEventListener('click', buyWithMoney);

// Модалки
closeModalBtn.addEventListener('click', closeModal);
closePointsModalBtn.addEventListener('click', closePointsModal);

// Закрытие по клику на overlay
paymentModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
pointsModal.querySelector('.modal-overlay').addEventListener('click', closePointsModal);

// Выбор способа оплаты
paymentMethodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const method = btn.dataset.method;
        selectedPaymentMethod = method;
        
        paymentMethodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        checkPaymentFormValid();
    });
});

// Валидация форм
paymentNickInput.addEventListener('input', checkPaymentFormValid);
pointsNickInput.addEventListener('input', checkPointsFormValid);

// Подтверждение
confirmPaymentBtn.addEventListener('click', confirmPayment);
confirmPointsBtn.addEventListener('click', confirmPointsPurchase);

// Обновление ника
updateNickBtn.addEventListener('click', updateMinecraftNick);

// Копирование IP
copyIpBtn.addEventListener('click', copyServerIP);

// ========== ИНИЦИАЛИЗАЦИЯ ==========

// Проверяем сохранённую сессию
function initApp() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserSection();
    } else {
        showAuthSection();
    }
}

// Запускаем приложение
initApp();

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanels.forEach((panel) => {
            panel.classList.toggle('active', panel.id === targetId);
        });
    });
});

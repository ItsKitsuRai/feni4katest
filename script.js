const nicknameInput = document.getElementById('mc-nick');
const saveButton = document.getElementById('save-nick-btn');
const statusDiv = document.getElementById('status');

function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'status-message error' : 'status-message success';
}

function loadNickname() {
    const savedNick = localStorage.getItem('mc_nick');
    if (savedNick) {
        nicknameInput.value = savedNick;
        showStatus(`Сохранённый ник: ${savedNick}`);
    }
}

function saveNickname() {
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        showStatus('Ошибка: введите ваш ник!', true);
        return;
    }
    
    localStorage.setItem('mc_nick', nickname);
    showStatus(`Ник сохранён: ${nickname}`);
}

saveButton.addEventListener('click', saveNickname);

nicknameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        saveNickname();
    }
});

loadNickname();

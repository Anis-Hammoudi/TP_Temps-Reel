const ws = new WebSocket('ws://localhost:8080');
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const usernameInput = document.getElementById('username');
const setUsernameBtn = document.getElementById('set-username');
let myUsername = '';
const disconnectBtn = document.getElementById('disconnect');

function disableChat() {
    input.disabled = true;
    sendBtn.disabled = true;
    usernameInput.disabled = true;
    setUsernameBtn.disabled = true;
    disconnectBtn.disabled = true;
}

disconnectBtn.onclick = () => {
    ws.close();
    addMessage('Vous êtes déconnecté du chat.', 'notification');
    disableChat();
};

function addMessage(text, className = '') {
    const msg = document.createElement('div');
    msg.className = className;
    msg.innerHTML = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

ws.onopen = () => {
    addMessage('Connexion WebSocket établie', 'info');
    disconnectBtn.disabled = false;
};
ws.onclose = () => {
    addMessage('Connexion fermée.', 'notification');
    disableChat();
};

ws.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        addMessage(event.data, 'error');
        return;
    }
    if (data.type === 'info') {
        addMessage(data.message, 'info');
    } else if (data.type === 'error') {
        addMessage(data.message, 'error');
    } else if (data.type === 'notification') {
        addMessage(data.message, 'notification');
    } else if (data.type === 'message') {
        const isMe = data.username === myUsername;
        addMessage(`<span class="user">${data.username}</span>: ${data.message}`, 'msg' + (isMe ? ' me' : ''));
    }
};

setUsernameBtn.onclick = () => {
    const username = usernameInput.value.trim();
    if (username.length < 2) {
        addMessage('Le pseudo doit contenir au moins 2 caractères.', 'error');
        return;
    }
    myUsername = username;
    ws.send(JSON.stringify({ type: 'set_username', username }));
    usernameInput.disabled = true;
    setUsernameBtn.disabled = true;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
};

sendBtn.onclick = () => {
    const msg = input.value.trim();
    if (msg) {
        ws.send(JSON.stringify({ type: 'message', message: msg }));
        input.value = '';
    }
};

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});

usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setUsernameBtn.click();
});

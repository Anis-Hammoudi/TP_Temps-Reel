let socket;
const statusDiv = document.getElementById('status');
const form = document.getElementById('connectForm');
const editorDiv = document.getElementById('editor');
const textArea = document.getElementById('text');
const userListSpan = document.getElementById('userList');
let username, room;

form.addEventListener('submit', function(e) {
    e.preventDefault();
    username = document.getElementById('username').value.trim();
    room = document.getElementById('room').value.trim();
    if (!username || !room) return;
    connectSocket();
});

function connectSocket() {
    socket = io({
        query: {
            room,
            token: '12345',
            username
        }
    });
    statusDiv.textContent = 'Connecting...';
    socket.on('connect', () => {
        statusDiv.textContent = 'Connected to room: ' + room;
        form.style.display = 'none';
        editorDiv.style.display = '';
    });
    socket.on('disconnect', () => {
        statusDiv.textContent = 'Disconnected';
        form.style.display = '';
        editorDiv.style.display = 'none';
    });
    socket.on('update', (text) => {
        textArea.value = text;
    });
    socket.on('notification', (data) => {
        if (data.type === 'join') {
            statusDiv.textContent = `${data.username} joined. Users: ${data.users.join(', ')}`;
        } else if (data.type === 'leave') {
            statusDiv.textContent = `${data.username} left. Users: ${data.users.join(', ')}`;
        }
        userListSpan.textContent = data.users.join(', ');
    });
    textArea.addEventListener('input', () => {
        socket.emit('update', textArea.value);
    });
}

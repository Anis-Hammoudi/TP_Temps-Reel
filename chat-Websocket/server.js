const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('Serveur WebSocket démarré sur ws://localhost:8080');

// Map pour stocker les pseudos des clients
const clients = new Map();

wss.on('connection', (ws) => {
    let username = null;
    console.log('Nouveau client connecté');

    ws.send(JSON.stringify({ type: 'info', message: 'Bienvenue ! Choisissez un pseudo pour commencer.' }));

    ws.on('message', (data) => {
        let msg;
        try {
            msg = JSON.parse(data);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Format de message invalide.' }));
            return;
        }

        if (msg.type === 'set_username') {
            username = msg.username?.trim() || 'Anonyme';
            clients.set(ws, username);
            ws.send(JSON.stringify({ type: 'info', message: `Vous êtes connecté en tant que ${username}` }));
            // Notifier tout le monde
            broadcast({ type: 'notification', message: `${username} a rejoint le chat.` });
            return;
        }

        if (msg.type === 'message' && username) {
            console.log(`[${username}] : ${msg.message}`);
            broadcast({ type: 'message', username, message: msg.message });
        }
    });

    ws.on('close', () => {
        if (username) {
            console.log(`Client déconnecté : ${username}`);
            clients.delete(ws);
            broadcast({ type: 'notification', message: `${username} a quitté le chat.` });
        } else {
            console.log('Client déconnecté');
        }
    });
});

function broadcast(obj) {
    const data = JSON.stringify(obj);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

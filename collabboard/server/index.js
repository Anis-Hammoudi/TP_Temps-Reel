// CollabBoard Server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Redis integration (optional, enabled if REDIS_URL is set)
let redisEnabled = false;
if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        redisEnabled = true;
        console.log('[Server] Redis adapter enabled');
    });
}

// Serve static client files
app.use(express.static(path.join(__dirname, '../client')));

// In-memory data
const rooms = {}; // { roomName: { users: Set, text: '', events: count } }
let totalEvents = 0;

// /status endpoint
app.get('/status', (req, res) => {
    const stats = {
        rooms: Object.keys(rooms),
        users: Object.fromEntries(Object.entries(rooms).map(([room, data]) => [room, Array.from(data.users)])),
        events: totalEvents
    };
    res.json(stats);
});

// Socket.IO logic
io.on('connection', (socket) => {
    const { room, token, username } = socket.handshake.query;
    if (token !== '12345' || !room || !username) {
        socket.disconnect(true);
        return;
    }
    // Join room
    socket.join(room);
    if (!rooms[room]) {
        rooms[room] = { users: new Set(), text: '', events: 0 };
    }
    rooms[room].users.add(username);
    // Notify others
    io.to(room).emit('notification', { type: 'join', username, users: Array.from(rooms[room].users) });
    // Send current text
    socket.emit('update', rooms[room].text);
    // Monitoring
    logStatus();
    // Events per minute tracking
    let eventCount = 0;
    const eventInterval = setInterval(() => {
        rooms[room].events = eventCount;
        totalEvents += eventCount;
        eventCount = 0;
    }, 60000);
    // Handle text update
    socket.on('update', (text) => {
        rooms[room].text = text;
        io.to(room).emit('update', text);
        eventCount++;
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        rooms[room].users.delete(username);
        io.to(room).emit('notification', { type: 'leave', username, users: Array.from(rooms[room].users) });
        if (rooms[room].users.size === 0) {
            delete rooms[room];
        }
        clearInterval(eventInterval);
        logStatus();
    });
});

function logStatus() {
    console.log(`[Server] Active connections: ${io.engine.clientsCount}`);
    console.log(`[Server] Active rooms: [${Object.keys(rooms).join(', ')}]`);
    const eventsPerMinute = Object.values(rooms).reduce((sum, r) => sum + r.events, 0);
    console.log(`[Server] Events per minute: ${eventsPerMinute}`);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Server] CollabBoard running on http://localhost:${PORT}`);
});

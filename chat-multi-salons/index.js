const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connexion à Redis
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPub = new Redis({ host: redisHost, port: redisPort });
const redisSub = new Redis({ host: redisHost, port: redisPort });

const REDIS_CHANNEL = 'chat_messages';

// Souscription au canal Redis
redisSub.subscribe(REDIS_CHANNEL, (err, count) => {
  if (err) {
    console.error('Erreur de souscription Redis:', err);
  } else {
    console.log(`Souscrit au canal Redis: ${REDIS_CHANNEL}`);
  }
});

// Lorsqu'un message arrive via Redis, le diffuser aux clients locaux
redisSub.on('message', (channel, message) => {
  if (channel === REDIS_CHANNEL) {
    try {
      const data = JSON.parse(message);
      // Diffuser le message à tous les clients du salon
      io.to(data.room).emit('chat message', data);
      // Afficher dans la console pour debug
      console.log(`[REDIS][${data.room}] ${data.username}: ${data.message}`);
    } catch (e) {
      console.error('Erreur de parsing message Redis:', e);
    }
  }
});

// Servir le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Écoute des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Gérer l'événement 'join room'
  socket.on('join room', (data) => {
    socket.join(data.room); // Ajoute le socket au salon
    socket.data.username = data.username; // Stocke le pseudo
    socket.data.room = data.room; // Stocke le salon actuel

    // Notifie tous les membres du salon (y compris le nouveau)
    io.to(data.room).emit('room message', { message: `${data.username} a rejoint le salon ${data.room}.` });
    console.log(`${data.username} a rejoint le salon ${data.room}`);
  });

  // Gérer l'événement 'chat message'
  socket.on('chat message', (data) => {
    // Publier le message sur Redis (sera diffusé à toutes les instances)
    redisPub.publish(REDIS_CHANNEL, JSON.stringify(data));
    // Optionnel : Diffuser localement aussi (pour rapidité, mais le message arrivera aussi via Redis)
    // io.to(data.room).emit('chat message', data);
    console.log(`[LOCAL][${data.room}] ${data.username}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
    if (socket.data.username && socket.data.room) {
      // Notifie les autres membres du salon que l'utilisateur est parti
      socket.to(socket.data.room).emit('room message', {
          message: `${socket.data.username} a quitté le salon ${socket.data.room}.`
      });
      console.log(`${socket.data.username} a quitté le salon ${socket.data.room}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  console.log(`Connecté à Redis sur ${redisHost}:${redisPort}`);
});
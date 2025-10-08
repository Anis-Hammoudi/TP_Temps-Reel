**Auteur : Anis Hammoudi  5AL- ESGI**



# TP Temps Réel

Ce dépôt contient trois projets indépendants illustrant des techniques de communication temps réel côté serveur et client :

## 1. chat-Websocket
Un chat minimaliste utilisant WebSocket, Node.js et une interface web statique.
- Technologies : Node.js, WebSocket, HTML, CSS, JS
- Dossier : `chat-Websocket/`

## 2. sse_stock_app
Application de streaming de données boursières en temps réel via Server-Sent Events (SSE) et Python Flask.
- Technologies : Python, Flask, SSE, HTML, CSS, JS
- Dossier : `sse_stock_app/`

## 3. chat-multi-salons
Application de chat en temps réel avec système de salons (rooms) utilisant Socket.IO.
- Technologies : Node.js, Express, Socket.IO, HTML, CSS, JS
- Fonctionnalités :
  - Création et rejoindre des salons
  - Messages en temps réel par salon
  - Notifications de connexion/déconnexion
  - Interface utilisateur responsive
- Dossier : `chat-multi-salons/`

## Démarrage rapide

### chat-multi-salons
```bash
cd chat-multi-salons
npm install
npm start
# Ouvrez http://localhost:3000 dans votre navigateur
```

### Autres projets
1. Consultez le README de chaque dossier pour les instructions spécifiques.
2. Installez les dépendances nécessaires dans chaque projet.
3. Lancez le serveur correspondant et ouvrez le client dans votre navigateur.

## Architecture des projets

- **chat-Websocket** : Communication bidirectionnelle simple avec WebSocket natif
- **sse_stock_app** : Communication unidirectionnelle serveur→client avec SSE
- **chat-multi-salons** : Communication bidirectionnelle avancée avec gestion de salons via Socket.IO

---




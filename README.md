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
Application de chat en temps réel avec système de salons (rooms) utilisant Socket.IO et **Redis Pub/Sub pour la scalabilité**.
- Technologies : Node.js, Express, Socket.IO, Redis, HTML, CSS, JS
- Fonctionnalités :
  - Création et rejoindre des salons
  - Messages en temps réel par salon
  - Notifications de connexion/déconnexion
  - Interface utilisateur responsive
  - **🆕 Support multi-instances avec Redis Pub/Sub**
  - **🆕 Haute disponibilité et scalabilité horizontale**
- Dossier : `chat-multi-salons/`

1. **Envoi d'un message** : Client → Socket.IO → Serveur local → Redis Pub
2. **Réception du message** : Redis Sub → Tous les serveurs → Tous les clients connectés
3. **Résultat** : Synchronisation parfaite entre toutes les instances

## Démarrage rapide

### chat-multi-salons
```bash
cd chat-multi-salons
npm install

# Démarrer Redis (requis pour la scalabilité)
docker run --name my-redis -p 6379:6379 -d redis/redis-stack-server:latest

# Option 1: Instance unique
npm start

# Option 2: Plusieurs instances (scalabilité)
$env:PORT=3000; node index.js # Terminal 1
$env:PORT=3001; node index.js  # Terminal 2
$env:PORT=3002; node index.js  # Terminal 3

# Testez sur http://localhost:3000, http://localhost:3001, etc.
# Les messages sont synchronisés entre toutes les instances via Redis
```

### Autres projets
1. Consultez le README de chaque dossier pour les instructions spécifiques.
2. Installez les dépendances nécessaires dans chaque projet.
3. Lancez le serveur correspondant et ouvrez le client dans votre navigateur.

## Architecture des projets

- **chat-Websocket** : Communication bidirectionnelle simple avec WebSocket natif
- **sse_stock_app** : Communication unidirectionnelle serveur→client avec SSE
- **chat-multi-salons** : Communication bidirectionnelle avancée avec gestion de salons via Socket.IO + **Redis Pub/Sub pour scalabilité**

## Technologies comparées

| Projet | Technologie | Bidirectionnel | Complexité | Scalabilité | Use Case |
|--------|------------|----------------|------------|-------------|----------|
| chat-Websocket | WebSocket | ✅ | Moyenne | ❌ | Chat simple |
| sse_stock_app | SSE | ❌ | Faible | ❌ | Streaming données |
| chat-multi-salons | Socket.IO + Redis | ✅ | Élevée | ✅ | Chat multi-utilisateurs scalable |

## 🚀 Scalabilité avec Redis Pub/Sub

Le projet `chat-multi-salons` démontre comment implémenter la scalabilité horizontale dans une application de chat temps réel :

### Problème résolu
- **Sans Redis** : Chaque instance de serveur est isolée. Les utilisateurs connectés au serveur A ne voient pas les messages des utilisateurs du serveur B.
- **Avec Redis** : Toutes les instances partagent les messages via Redis Pub/Sub, créant une expérience cohérente.

### Avantages
- **Haute disponibilité** : Si une instance tombe, les autres continuent de fonctionner
- **Scalabilité** : Ajout facile de nouvelles instances pour gérer plus d'utilisateurs
- **Performance** : Répartition de la charge sur plusieurs serveurs

### Test de scalabilité
1. Lancez Redis : `docker run --name my-redis -p 6379:6379 -d redis/redis-stack-server:latest`
2. Lancez plusieurs instances : `PORT=3000 node index.js`, `PORT=3001 node index.js`, etc.
3. Connectez des clients à différentes instances
4. Vérifiez que tous les messages sont synchronisés entre les instances

---




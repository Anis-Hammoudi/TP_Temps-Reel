**Auteur : Anis Hammoudi  5AL- ESGI**



# TP Temps Réel

Ce dépôt contient quatre projets indépendants illustrant des techniques de communication temps réel côté serveur et client :

## 1. chat-Websocket
Un chat minimaliste utilisant WebSocket, Node.js et une interface web statique.
- Technologies : Node.js, WebSocket, HTML, CSS, JS
- Dossier : `chat-Websocket/`

## 2. sse_stock_app
Application de streaming de données boursières en temps réel via Server-Sent Events (SSE) et Python Flask.
- Technologies : Python, Flask, SSE, HTML, CSS, JS
**Auteur : Anis Hammoudi — 5AL ESGI**

# TP_Temps-Reel

Ce dépôt regroupe plusieurs projets illustrant les techniques de communication temps réel côté serveur et client, avec Node.js, Python, WebSocket, SSE, Socket.IO et Redis.

## Liste des projets

- **collabboard/** : Éditeur de texte collaboratif en temps réel (Node.js, Express, Socket.IO, Redis)
- **chat-multi-salons/** : Chat multi-salons scalable avec Socket.IO et Redis Pub/Sub
- **chat-Websocket/** : Chat minimaliste utilisant WebSocket natif
- **collaborative-dashboard/** : Tableau de bord collaboratif sécurisé (authentification JWT)
- **Live-App-Temps-Reels/** : Exercices et démonstrations temps réel
- **sse_stock_app/** : Application de streaming boursier en temps réel (SSE, Flask)
- **projet-final/** : Ressources du projet final

## Démarrage rapide : CollabBoard

1. Ouvrez le dossier `collabboard` :
  ```
  cd collabboard
  npm install
  node server/index.js
  ```
2. (Optionnel) Lancez Redis pour le scaling multi-instance :
  ```
  docker run --name redis-collabboard -p 6379:6379 redis
  ```
3. Accédez à `http://localhost:3000/` dans votre navigateur.

## Installation et utilisation générale

- Chaque projet est autonome dans son dossier.
- Installez les dépendances nécessaires dans chaque projet (`npm install` ou `pip install ...`).
- Lancez le serveur correspondant et ouvrez le client dans votre navigateur.
- Consultez le README de chaque dossier pour les instructions spécifiques.

## Architecture des projets

- **chat-Websocket** : Communication bidirectionnelle simple avec WebSocket natif
- **sse_stock_app** : Streaming unidirectionnel serveur→client avec SSE
- **chat-multi-salons** : Chat scalable avec Socket.IO et Redis Pub/Sub
- **collaborative-dashboard** : Application collaborative sécurisée avec authentification JWT et gestion d'état temps réel
- **collabboard** : Éditeur de texte collaboratif multi-utilisateurs, scalable avec Redis

## Scalabilité avec Redis Pub/Sub

Le projet `chat-multi-salons` (et `collabboard`) démontrent la scalabilité horizontale :

- **Sans Redis** : Chaque instance de serveur est isolée. Les utilisateurs connectés au serveur A ne voient pas les messages des utilisateurs du serveur B.
- **Avec Redis** : Toutes les instances partagent les messages via Redis Pub/Sub, créant une expérience cohérente et scalable.

### Avantages

- Haute disponibilité : Si une instance tombe, les autres continuent de fonctionner
- Scalabilité : Ajout facile de nouvelles instances pour gérer plus d'utilisateurs
- Performance : Répartition de la charge sur plusieurs serveurs

### Test de scalabilité

1. Lancez Redis :
  ```
  docker run --name my-redis -p 6379:6379 -d redis/redis-stack-server:latest
  ```
2. Lancez plusieurs instances :
  ```
  $env:PORT=3000; node index.js
  $env:PORT=3001; node index.js
  $env:PORT=3002; node index.js
  ```
3. Connectez des clients à différentes instances (`http://localhost:3000`, `http://localhost:3001`, ...)
4. Vérifiez que tous les messages sont synchronisés entre les instances

## Licence

MIT
3. Connectez des clients à différentes instances

4. Vérifiez que tous les messages sont synchronisés entre les instances



---

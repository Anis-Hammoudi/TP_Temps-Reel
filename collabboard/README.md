# CollabBoard - Éditeur de texte collaboratif en temps réel

Structure du projet :
- server/index.js
- client/index.html
- client/script.js

Prérequis :
- Node.js
- Redis (optionnel, pour le scaling multi-instance)

Instructions d'installation :

1. Installer les dépendances :

   cd collabboard
   npm install express socket.io redis @socket.io/redis-adapter

2. Lancer Redis en local (optionnel, pour le scaling) :

   - Avec Docker :
     docker run --name redis-collabboard -p 6379:6379 redis
   - Ou installer Redis depuis https://redis.io/download

3. Démarrer le serveur :

   node server/index.js

   - Option : définir la variable d'environnement REDIS_URL pour activer l'adaptateur Redis :
     set REDIS_URL=redis://localhost:6379

4. Ouvrir le client :

   http://localhost:3000/
   Exemple : http://localhost:3000/?room=test&token=12345

Utilisation :
- Saisir un nom d'utilisateur et un nom de salon pour rejoindre.
- Seul le token '12345' est accepté.
- Le texte partagé et la liste des utilisateurs sont synchronisés en temps réel.

Monitoring :
- La console du serveur affiche les connexions actives, les salons et le nombre d'événements par minute.
- Le point d'accès /status retourne les statistiques en JSON.

Notes :
- Pas de base de données requise. Données en mémoire et Redis pour le scaling.
- Code modulaire et commenté pour la clarté.

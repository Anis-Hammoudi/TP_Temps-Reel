# Chat Multi-Salons avec Socket.IO

Une application de chat en temps réel permettant aux utilisateurs de rejoindre différents salons et d'échanger des messages visibles uniquement par les membres du salon.

## 🚀 Fonctionnalités

- **Salons multiples** : Les utilisateurs peuvent rejoindre différents salons
- **Messages en temps réel** : Communication instantanée via Socket.IO
- **Notifications** : Annonces de connexion et déconnexion des utilisateurs
- **Interface responsive** : Design moderne et adaptatif
- **Pseudo personnalisé** : Chaque utilisateur choisit son nom d'affichage

## 🛠 Technologies utilisées

- **Backend** : Node.js, Express, Socket.IO
- **Frontend** : HTML5, CSS3, JavaScript (ES6)
- **Communication** : WebSocket via Socket.IO

## 📦 Installation

1. **Cloner le projet** (si pas déjà fait)
   ```bash
   git clone [url-du-repo]
   cd TP_Temps-Reel/chat-multi-salons
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm start
   # ou
   node index.js
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🎮 Utilisation

1. **Rejoindre un salon**
   - Entrez votre pseudo
   - Choisissez un nom de salon (ex: "général", "dev", "random")
   - Cliquez sur "Rejoindre le salon"

2. **Envoyer des messages**
   - Tapez votre message dans le champ de saisie
   - Appuyez sur Entrée ou cliquez sur "Envoyer"
   - Le message sera visible par tous les membres du salon

3. **Tester avec plusieurs utilisateurs**
   - Ouvrez plusieurs onglets ou fenêtres
   - Rejoignez le même salon ou des salons différents
   - Testez l'envoi de messages et les notifications

## 🏗 Architecture

### Côté Serveur (`index.js`)
- **Express** : Serveur HTTP et service des fichiers statiques
- **Socket.IO** : Gestion des connexions WebSocket
- **Événements gérés** :
  - `join room` : Ajout d'un utilisateur à un salon
  - `chat message` : Diffusion d'un message dans un salon
  - `disconnect` : Notification de déconnexion

### Côté Client (`index.html`)
- **Interface utilisateur** : Formulaires de connexion et de chat
- **Événements Socket.IO** :
  - Émission : `join room`, `chat message`
  - Réception : `chat message`, `room message`
- **Gestion de l'état** : Pseudo et salon actuels

## 🔧 Personnalisation

### Ajouter de nouvelles fonctionnalités

1. **Liste des utilisateurs connectés**
   ```javascript
   // Serveur
   socket.on('join room', (data) => {
     // ... code existant
     io.to(data.room).emit('user list', getUsersInRoom(data.room));
   });
   ```

2. **Messages privés**
   ```javascript
   // Serveur
   socket.on('private message', (data) => {
     io.to(data.targetUserId).emit('private message', data);
   });
   ```

3. **Historique des messages**
   - Stocker les messages en base de données
   - Charger l'historique lors de la connexion à un salon

### Modification du style
Le CSS est intégré dans `index.html`. Vous pouvez :
- Changer les couleurs dans les variables CSS
- Modifier la mise en page des messages
- Ajouter des animations

## 🐛 Débogage

### Problèmes courants

1. **Port 3000 déjà utilisé**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /F /PID [PID]
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

2. **Erreur de modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Messages non reçus**
   - Vérifiez la console du navigateur
   - Vérifiez les logs du serveur
   - Assurez-vous d'être dans le bon salon

### Logs utiles
- Console serveur : `console.log()` dans `index.js`
- Console navigateur : F12 → Console
- Événements Socket.IO : Activez le debug avec `localStorage.debug = 'socket.io-client:socket'`

## 📝 Structure du projet

```
chat-multi-salons/
├── index.js          # Serveur Express + Socket.IO
├── index.html        # Interface utilisateur complète
├── package.json      # Dépendances et scripts
├── package-lock.json # Versions exactes des dépendances
└── README.md         # Cette documentation
```

## 🚀 Améliorations futures

- [ ] Base de données pour persistance des messages
- [ ] Authentification utilisateur
- [ ] Salons privés avec mot de passe
- [ ] Partage de fichiers/images
- [ ] Notification de frappe en cours
- [ ] Interface d'administration
- [ ] Support mobile amélioré
- [ ] Tests automatisés

## 📚 Ressources

- [Documentation Socket.IO](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Projet réalisé dans le cadre du TP Temps Réel - ESGI**
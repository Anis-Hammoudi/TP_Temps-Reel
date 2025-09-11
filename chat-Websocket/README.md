
# Chat WebSocket minimal

Petit chat en temps réel avec WebSocket, Node.js et interface web statique.

**Fichiers :**
- `client.html`, `client.js`, `style.css`, `server.js`, `package.json`

**Démarrage :**
1. `npm install`
2. `node server.js`
3. Ouvrir `client.html` dans le navigateur

**Dépendance :**
- `ws` (WebSocket côté Node.js)

**Notes :**
- Le client se connecte à `ws://localhost:8080`
- Servez en HTTP pour éviter les soucis avec `file://`

Démarrage rapide
1. Assurez-vous que Node.js est installé (>= 12).
2. Depuis le dossier de ce projet, lancez votre serveur. Si vous avez un server.js qui démarre un serveur WebSocket, exécutez :

```powershell
node server.js
```

3. Ouvrez `client.html` dans votre navigateur (http(s) ou file://). Le client tente de se connecter à ws://localhost:8080 par défaut.

Résolution des problèmes
- Si le client affiche "Connexion fermée." ou ne peut pas se connecter, assurez-vous que le serveur fonctionne et écoute sur ws://localhost:8080.
- Si vous hébergez `client.html` via HTTPS, les navigateurs bloquent ws:// et exigent wss://. Servez la page en HTTP ou activez TLS et utilisez wss://.

Notes / prochaines étapes
- Envisagez d'ajouter un petit serveur HTTP (par exemple avec le module `http` ou le package npm `serve`) pour pouvoir ouvrir la page depuis http://localhost et éviter les problèmes d'origine file://.
- Ajoutez des vérifications côté serveur pour valider l'unicité des noms d'utilisateur, la taille des messages et la limitation du débit.

# Chat Multi-Salons Scalable

Application de chat temps réel avec salons multiples et scalabilité Redis Pub/Sub.

## Fonctionnalités

- Chat en temps réel avec Socket.IO
- Salons multiples (rooms)
- **Scalabilité** : Plusieurs instances de serveur synchronisées via Redis
- Interface web simple et responsive

## Installation Rapide

### 1. Prérequis
- Node.js
- Docker (pour Redis)

### 2. Installation
```bash
# Cloner et installer
git clone [repo]
cd chat-multi-salons
npm install

# Démarrer Redis
docker run --name my-redis -p 6379:6379 -d redis/redis-stack-server:latest
```

### 3. Lancement

**Une seule instance :**
```bash
npm start
# → http://localhost:3000
```

**Plusieurs instances (scalabilité) :**

**Windows PowerShell :**
```powershell
# Terminal 1
$env:PORT=3000; node index.js

# Terminal 2  
$env:PORT=3001; node index.js

# Terminal 3
$env:PORT=3002; node index.js
```

**Linux/macOS :**
```bash
# Terminal 1
PORT=3000 node index.js

# Terminal 2
PORT=3001 node index.js

# Terminal 3  
PORT=3002 node index.js
```

##  Test de Scalabilité

1. **Lancer Redis et 3 instances** (voir ci-dessus)
2. **Ouvrir 3 onglets :**
   - `http://localhost:3000`
   - `http://localhost:3001` 
   - `http://localhost:3002`
3. **Rejoindre le même salon** (ex: "test") sur les 3 onglets
4. **Envoyer des messages** depuis n'importe quel onglet
5. **Résultat :** Tous les utilisateurs voient tous les messages ! ✅

## 🔧 Comment ça marche

### Sans Redis (problème)
```
Serveur A ←→ Clients A
Serveur B ←→ Clients B
```
### Avec Redis Pub/Sub (solution)
```
Serveur A ←→ Redis ←→ Serveur B
    ↓                    ↓
Clients A            Clients B
```

### Architecture
- **Client** → envoie message → **Serveur local** 
- **Serveur local** → publie sur **Redis**
- **Redis** → notifie **tous les serveurs**
- **Tous les serveurs** → diffusent aux **clients locaux**

## 🛠 Technologies

- **Backend :** Node.js, Express, Socket.IO
- **Scalabilité :** Redis Pub/Sub
- **Frontend :** HTML/JS vanilla

##  Structure

```
chat-multi-salons/
├── index.js       # Serveur Node.js + Socket.IO + Redis
├── index.html     # Interface client
├── package.json   # Dépendances
└── README.md      # Cette doc
```

---

** Objectif pédagogique :** Comprendre la scalabilité horizontale avec Redis Pub/Sub dans les applications temps réel.
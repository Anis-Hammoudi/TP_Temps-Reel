# 🚀 Guide de Déploiement - Tableau de Bord Collaboratif

Ce guide explique comment déployer l'application collaborative sécurisée en production.

## 📋 Prérequis

- Node.js 14+ installé sur le serveur
- Nom de domaine (optionnel mais recommandé)
- Certificat SSL/TLS pour HTTPS
- Base de données (pour une version persistante)

## 🔧 Configuration de Production

### 1. Variables d'environnement

Créer un fichier `.env` basé sur `.env.example` :

```bash
cp .env.example .env
```

Modifier les valeurs pour la production :

```env
# Port (utilisé par le reverse proxy)
PORT=3000

# Secret JWT CRITIQUE - GÉNÉRER UNE VALEUR ALÉATOIRE FORTE
JWT_SECRET=your-super-secret-jwt-key-256-bits-minimum

# Environnement
NODE_ENV=production

# Configuration de sécurité renforcée
BCRYPT_SALT_ROUNDS=12
JWT_EXPIRES_IN=2h

# CORS pour votre domaine
CORS_ORIGIN=https://votre-domaine.com

# Activation des logs en production
DEBUG_LOGS=true
```

### 2. Installation des dépendances

```bash
npm ci --only=production
```

### 3. Gestionnaire de processus (PM2)

Installer PM2 globalement :
```bash
npm install -g pm2
```

Créer un fichier `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [{
    name: 'collaborative-dashboard',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Démarrer l'application :
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🌐 Configuration Nginx (Reverse Proxy)

Créer un fichier de configuration Nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    # Certificats SSL
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuration spéciale pour Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Sécurité en Production

### 1. Firewall (UFW sur Ubuntu)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban pour protection contre les attaques

```bash
sudo apt install fail2ban
```

Configuration dans `/etc/fail2ban/jail.local` :
```ini
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
```

### 3. Rate Limiting

Ajouter à la configuration Nginx :
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... reste de la configuration
}
```

### 4. Headers de sécurité

Ajouter à Nginx :
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 💾 Base de Données (Optionnel)

Pour la persistance des données, remplacer le stockage en mémoire :

### MongoDB
```javascript
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    content: String,
    authorId: Number,
    authorName: String,
    createdAt: Date,
    updatedAt: Date
});

const Note = mongoose.model('Note', noteSchema);
```

### PostgreSQL
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
pm2 monit
```

### 2. Logs
```bash
pm2 logs collaborative-dashboard --lines 100
```

### 3. Health Check
Créer un endpoint de santé dans server.js :
```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
```

## 🔄 Déploiement Automatisé

### Script de déploiement (`deploy.sh`)
```bash
#!/bin/bash
set -e

echo "🚀 Déploiement de l'application collaborative..."

# Sauvegarde
pm2 stop collaborative-dashboard || true

# Mise à jour du code
git pull origin main

# Installation des dépendances
npm ci --only=production

# Tests
npm test

# Redémarrage
pm2 start ecosystem.config.js --env production

echo "✅ Déploiement terminé !"
```

### GitHub Actions (optionnel)
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /path/to/app
          ./deploy.sh
```

## 🧪 Tests de Production

1. **Test de charge**
   ```bash
   npm install -g artillery
   artillery quick --count 10 --num 100 https://votre-domaine.com
   ```

2. **Test de sécurité**
   ```bash
   npm run test
   ```

3. **Test SSL**
   ```bash
   nmap --script ssl-enum-ciphers -p 443 votre-domaine.com
   ```

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Secret JWT généré et sécurisé
- [ ] Certificat SSL installé
- [ ] Nginx configuré avec HTTPS
- [ ] Firewall activé
- [ ] PM2 configuré et démarré
- [ ] Logs configurés et rotatifs
- [ ] Monitoring en place
- [ ] Sauvegarde automatisée
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour

## 🚨 Maintenance

### Mise à jour de sécurité
```bash
npm audit
npm audit fix
```

### Rotation des logs
Configurer logrotate pour PM2 :
```bash
sudo nano /etc/logrotate.d/pm2
```

### Sauvegarde quotidienne
```bash
# Crontab
0 2 * * * /path/to/backup-script.sh
```

---

**⚠️ Important** : Testez toujours le déploiement sur un environnement de staging avant la production !
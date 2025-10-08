#  Tableau de Bord Collaboratif Sécurisé

Une application de collaboration en temps réel permettant aux utilisateurs de créer, modifier et supprimer des notes partagées avec un système d'authentification et d'autorisation robuste.

##  Objectifs du Projet

Ce projet démontre l'implémentation de mécanismes de sécurité dans une application temps réel :

- **Authentification** : Système de connexion/inscription avec JWT
- **Autorisation** : Contrôle d'accès basé sur la propriété des données
- **Temps réel sécurisé** : Synchronisation instantanée avec Socket.IO
- **Interface utilisateur adaptative** : Affichage conditionnel selon les permissions

## Architecture

```
collaborative-dashboard/
├── server.js                 # Serveur principal Express.js + Socket.IO
├── middleware/
│   └── auth.js              # Middleware d'authentification JWT
├── public/
│   ├── index.html           # Interface utilisateur
│   ├── app.js              # Logique frontend
│   └── styles.css          # Styles CSS
├── package.json
└── README.md
```

##  Technologies Utilisées

### Backend
- **Node.js** : Environnement d'exécution JavaScript
- **Express.js** : Framework web minimaliste
- **Socket.IO** : Communication temps réel bidirectionnelle
- **JSON Web Tokens (JWT)** : Authentification stateless
- **bcrypt** : Hachage sécurisé des mots de passe
- **CORS** : Gestion des requêtes cross-origin

### Frontend
- **HTML5/CSS3** : Structure et styles
- **JavaScript ES6+** : Logique applicative
- **Socket.IO Client** : Communication temps réel
- **Local Storage** : Persistance du token d'authentification

## Installation et Lancement

### Prérequis
- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)

### Étapes d'installation

1. **Cloner ou télécharger le projet**
   ```bash
   cd collaborative-dashboard
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm start
   # ou pour le développement avec auto-reload :
   npm run dev
   ```

4. **Accéder à l'application**
   Ouvrir un navigateur et aller à : `http://localhost:3000`

##  Fonctionnalités de Sécurité

### 1. Authentification

#### Inscription d'utilisateur
- **Endpoint** : `POST /api/register`
- **Validation** : Nom d'utilisateur (≥3 caractères), mot de passe (≥6 caractères)
- **Sécurité** : Hachage bcrypt avec salt rounds = 10
- **Réponse** : JWT token + informations utilisateur

#### Connexion
- **Endpoint** : `POST /api/login`
- **Validation** : Vérification du hash bcrypt
- **Sécurité** : Token JWT avec expiration 24h
- **Gestion d'erreur** : Messages sécurisés sans révéler d'informations

### 2. Autorisation

#### Middleware d'authentification (`authenticateToken`)
```javascript
// Vérification du token JWT dans l'en-tête Authorization
Authorization: Bearer <token>
```

#### Contrôle d'accès aux notes
- **Lecture** : Accessible à tous (authentifiés ou non)
- **Création** : Réservée aux utilisateurs authentifiés
- **Modification** : Uniquement le propriétaire de la note
- **Suppression** : Uniquement le propriétaire de la note

#### Vérification de propriété
```javascript
const checkOwnership = (resource, userId) => {
    return resource.authorId === userId;
};
```

### 3. Sécurité des Communications

#### API REST sécurisée
- Validation d'entrée sur tous les endpoints
- Gestion d'erreurs appropriée (401, 403, 404)
- Tokens d'expiration automatique

#### Socket.IO temps réel
- Diffusion des mises à jour à tous les clients connectés
- Synchronisation instantanée sans compromettre la sécurité
- Pas d'authentification Socket.IO (lecture seule pour la diffusion)

##  Endpoints API

### Authentification
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/register` | Inscription utilisateur | Non |
| POST | `/api/login` | Connexion utilisateur | Non |
| GET | `/api/me` | Infos utilisateur connecté | Oui |

### Gestion des notes
| Méthode | Endpoint | Description | Auth requise | Propriété |
|---------|----------|-------------|--------------|-----------|
| GET | `/api/notes` | Lister toutes les notes | Non | - |
| POST | `/api/notes` | Créer une note | Oui | - |
| PUT | `/api/notes/:id` | Modifier une note | Oui | Oui |
| DELETE | `/api/notes/:id` | Supprimer une note | Oui | Oui |

## 🎮 Utilisation

### Première utilisation

1. **Inscription** : Créer un compte avec nom d'utilisateur et mot de passe
2. **Connexion** : Se connecter avec les identifiants créés
3. **Ajouter des notes** : Utiliser le formulaire pour créer des notes
4. **Collaboration** : Voir les notes des autres utilisateurs en temps réel

### Interface utilisateur

#### Pour les utilisateurs non connectés
- ✅ Consultation des notes existantes
- ❌ Ajout, modification, suppression de notes
- 📋 Message explicatif pour encourager la connexion

#### Pour les utilisateurs connectés
- ✅ Toutes les fonctionnalités de lecture
- ✅ Création de nouvelles notes
- ✅ Modification/suppression de leurs propres notes
- ❌ Modification/suppression des notes d'autres utilisateurs

### Indicateurs visuels
- **Notes personnelles** : Fond vert avec badge "Vos notes"
- **Notes d'autres utilisateurs** : Fond gris avec mention "Lecture seule"
- **Statut de connexion** : Indicateur coloré (vert=connecté, rouge=déconnecté)

## 🧪 Scénarios de Test

### Test de sécurité

1. **Accès non autorisé**
   ```bash
   # Tentative de création sans token
   curl -X POST http://localhost:3000/api/notes \\
     -H "Content-Type: application/json" \\
     -d '{"content":"Test sans auth"}'
   # Réponse attendue : 401 Unauthorized
   ```

2. **Modification de note d'autrui**
   - Créer une note avec l'utilisateur A
   - Se connecter avec l'utilisateur B
   - Tenter de modifier la note de A
   - Réponse attendue : 403 Forbidden

3. **Token expiré**
   - Modifier l'expiration du token dans auth.js
   - Attendre l'expiration
   - Tenter une action
   - Réponse attendue : Redirection vers connexion

### Test de fonctionnalité

1. **Collaboration temps réel**
   - Ouvrir plusieurs onglets/navigateurs
   - Créer/modifier/supprimer des notes
   - Vérifier la synchronisation instantanée

2. **Persistance**
   - Créer des notes
   - Redémarrer le serveur
   - Vérifier que les notes sont perdues (stockage mémoire)

## 🔐 Choix de Sécurité

### JWT (JSON Web Tokens)
**Avantages :**
- Stateless : Pas de stockage serveur des sessions
- Scalable : Fonctionne dans un environnement distribué
- Auto-expirant : Sécurité par expiration automatique

**Configuration :**
- Durée de vie : 24 heures
- Secret : Configurable via variable d'environnement
- Payload : ID utilisateur + nom d'utilisateur

### Hachage des mots de passe
**bcrypt avec salt rounds = 10 :**
- Protection contre les attaques par dictionnaire
- Résistance aux attaques par force brute
- Évolutif (possibilité d'augmenter les rounds)

### Validation des entrées
- Longueur minimale des mots de passe (6 caractères)
- Longueur minimale des noms d'utilisateur (3 caractères)
- Limitation du contenu des notes (500 caractères)
- Échappement HTML pour prévenir XSS

## 🚀 Améliorations Possibles

### Sécurité avancée
1. **Rate limiting** : Limitation du nombre de requêtes
2. **HTTPS** : Chiffrement des communications
3. **Refresh tokens** : Renouvellement sécurisé des tokens
4. **Socket.IO authentification** : Authentification des connexions WebSocket
5. **Validation d'entrée avancée** : Utilisation de bibliothèques comme Joi
6. **Logs de sécurité** : Journalisation des tentatives d'accès

### Fonctionnalités
1. **Base de données** : Persistance avec MongoDB/PostgreSQL
2. **Catégories de notes** : Organisation par tags/catégories
3. **Notifications** : Alertes pour les nouvelles notes
4. **Export** : Sauvegarde des notes en PDF/JSON
5. **Mode hors ligne** : Service Worker pour le cache

### Interface utilisateur
1. **Mode sombre** : Thème sombre/clair
2. **Responsive design** : Optimisation mobile
3. **Glisser-déposer** : Réorganisation des notes
4. **Recherche** : Filtrage et recherche de notes
5. **Éditeur riche** : Markdown ou éditeur WYSIWYG

## 🐛 Débogage

### Problèmes courants

1. **Erreur de connexion Socket.IO**
   - Vérifier que le serveur est démarré
   - Contrôler les paramètres CORS

2. **Token invalide**
   - Vérifier la variable JWT_SECRET
   - Contrôler l'expiration du token

3. **Erreurs de validation**
   - Vérifier les longueurs min/max des champs
   - Contrôler les caractères spéciaux

4. **404 sur /api/auth/register ou /api/auth/login** ✅ CORRIGÉ
   - **Problème** : Endpoints incorrects dans le client
   - **Solution** : Les routes sont `/api/register` et `/api/login` (sans `/auth/`)
   - **Fix appliqué** : Correction des URLs dans app.js

5. **Username affiché comme "undefined"** ✅ CORRIGÉ
   - **Problème** : Mauvaise récupération du nom d'utilisateur lors de la connexion
   - **Solution** : Utiliser `data.user.username` au lieu de `username` du formulaire
   - **Fix appliqué** : Correction dans les fonctions login() et register()

6. **Notes en "Lecture seule" pour le propriétaire** ✅ CORRIGÉ
   - **Problème** : Comparaison incorrecte entre `note.author` et `note.authorName`
   - **Solution** : Le serveur envoie `authorName`, pas `author`
   - **Fix appliqué** : Mise à jour de toutes les vérifications de propriété

7. **Pas de mises à jour temps réel** ✅ CORRIGÉ
   - **Problème** : Client écoute des événements inexistants (`noteCreated`, `noteUpdated`)
   - **Solution** : Le serveur émet uniquement `notes_updated`
   - **Fix appliqué** : Ajout du bon gestionnaire d'événement

8. **HTML malformé dans la meta viewport**
   - **Problème** : Contenu corrompu dans la balise meta
   - **Solution** : Correction de la balise viewport
   - **Fix appliqué** : HTML nettoyé dans index.html

### Logs utiles
```javascript
// Activation des logs détaillés
DEBUG=socket.io:* node server.js
```

## 👨‍💻 Développement

### Structure du code
- **Modularité** : Séparation des préoccupations
- **Middleware** : Réutilisabilité des fonctions d'auth
- **Gestion d'erreurs** : Codes HTTP appropriés
- **Documentation** : Commentaires et JSDoc

### Standards de code
- ES6+ avec const/let
- Fonctions async/await
- Gestion des erreurs avec try/catch
- Validation côté client et serveur

## 📄 Licence

Ce projet est développé à des fins éducatives dans le cadre d'un TP sur la sécurisation d'applications temps réel.

---

**Auteur** : Anis Hammoudi  
**Date** : Octobre 2025  
**Version** : 1.1.0 (Corrections majeures appliquées)

### 🔄 Changelog v1.1.0
- ✅ Correction des endpoints d'authentification
- ✅ Fix de l'affichage du nom d'utilisateur  
- ✅ Résolution des problèmes de propriété des notes
- ✅ Implémentation des mises à jour temps réel
- ✅ Correction de l'HTML malformé
- ✅ Amélioration de la documentation de débogage
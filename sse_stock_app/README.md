# Application SSE Stock

Ce projet est une application simple de suivi de stocks en temps réel utilisant les Server-Sent Events (SSE).

## Fonctionnalités
- Mises à jour des stocks en temps réel via SSE
- Interface web simple (HTML, CSS, JS)
- Serveur backend Python

## Structure du projet
```
server.py            # Serveur Python principal
static/
  script.js          # JavaScript côté client
  styles.css         # CSS côté client
templates/
  index.html         # Page HTML principale
```

## Prise en main

### Prérequis
- Python 3.x

### Installation

. Installer les dépendances nécessaires (si besoin) :
   ```
   pip install flask
   ```

### Lancer le serveur
```
python server.py
```

Ouvrez votre navigateur et allez sur `http://localhost:5000` pour accéder à l'application.

## Licence
MIT

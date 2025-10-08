const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const { authenticateToken, optionalAuth, generateToken, checkOwnership } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stockage en mémoire pour les notes et utilisateurs
let notes = [];
let users = [];
let noteIdCounter = 1;
let userIdCounter = 1;

// Routes API REST pour les notes (Version non sécurisée - Partie 1)

// GET /notes - Récupérer toutes les notes (accessible à tous)
app.get('/api/notes', optionalAuth, (req, res) => {
    console.log('GET /api/notes - Envoi de', notes.length, 'notes');
    res.json(notes);
});

// Routes d'authentification (Partie 2)

// POST /register - Inscription d'un nouvel utilisateur
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validation des données
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Nom d\'utilisateur et mot de passe requis' 
            });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ 
                error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Le mot de passe doit contenir au moins 6 caractères' 
            });
        }
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Ce nom d\'utilisateur est déjà pris' 
            });
        }
        
        // Hacher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Créer le nouvel utilisateur
        const newUser = {
            id: userIdCounter++,
            username: username.trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        console.log('Nouvel utilisateur créé:', { id: newUser.id, username: newUser.username });
        
        // Générer un JWT
        const token = generateToken(newUser);
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur' 
        });
    }
});

// POST /login - Connexion d'un utilisateur
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validation des données
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Nom d\'utilisateur et mot de passe requis' 
            });
        }
        
        // Trouver l'utilisateur
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!user) {
            return res.status(401).json({ 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }
        
        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }
        
        // Générer un JWT
        const token = generateToken(user);
        
        console.log('Utilisateur connecté:', { id: user.id, username: user.username });
        
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur' 
        });
    }
});

// GET /me - Informations sur l'utilisateur connecté
app.get('/api/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    if (!user) {
        return res.status(404).json({ 
            error: 'Utilisateur non trouvé' 
        });
    }
    
    res.json({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
    });
});

// POST /notes - Créer une nouvelle note (SÉCURISÉ)
app.post('/api/notes', authenticateToken, (req, res) => {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le contenu de la note est requis' });
    }
    
    const newNote = {
        id: noteIdCounter++,
        content: content.trim(),
        authorId: req.userId, // Utiliser l'ID de l'utilisateur authentifié
        authorName: req.username, // Ajouter le nom pour l'affichage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    console.log('Nouvelle note créée par', req.username + ':', newNote);
    
    // Diffusion temps réel à tous les clients connectés
    io.emit('notes_updated', notes);
    
    res.status(201).json(newNote);
});

// PUT /notes/:id - Mettre à jour une note (SÉCURISÉ)
app.put('/api/notes/:id', authenticateToken, (req, res) => {
    const noteId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le contenu de la note est requis' });
    }
    
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note non trouvée' });
    }
    
    // Vérifier la propriété de la note
    if (!checkOwnership(notes[noteIndex], req.userId)) {
        return res.status(403).json({ 
            error: 'Accès refusé',
            message: 'Vous ne pouvez modifier que vos propres notes'
        });
    }
    
    notes[noteIndex].content = content.trim();
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    console.log('Note mise à jour par', req.username + ':', notes[noteIndex]);
    
    // Diffusion temps réel à tous les clients connectés
    io.emit('notes_updated', notes);
    
    res.json(notes[noteIndex]);
});

// DELETE /notes/:id - Supprimer une note (SÉCURISÉ)
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
    const noteId = parseInt(req.params.id);
    
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note non trouvée' });
    }
    
    // Vérifier la propriété de la note
    if (!checkOwnership(notes[noteIndex], req.userId)) {
        return res.status(403).json({ 
            error: 'Accès refusé',
            message: 'Vous ne pouvez supprimer que vos propres notes'
        });
    }
    
    const deletedNote = notes.splice(noteIndex, 1)[0];
    console.log('Note supprimée par', req.username + ':', deletedNote);
    
    // Diffusion temps réel à tous les clients connectés
    io.emit('notes_updated', notes);
    
    res.json({ message: 'Note supprimée avec succès', note: deletedNote });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté:', socket.id);
    
    // Envoyer les notes existantes au nouveau client
    socket.emit('notes_updated', notes);
    
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
    });
});

// Route pour servir la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('📝 Application de tableau de bord collaboratif');
    console.log('� Version sécurisée avec authentification JWT');
    console.log('👤 Utilisateurs connectés:', users.length);
    console.log('📄 Notes stockées:', notes.length);
});

module.exports = { app, server, io };
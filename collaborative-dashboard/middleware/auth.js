const jwt = require('jsonwebtoken');

// Secret pour signer les JWT (en production, utilisez une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Token d\'accès requis',
            message: 'Vous devez être connecté pour effectuer cette action'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Token invalide',
                message: 'Votre session a expiré, veuillez vous reconnecter'
            });
        }
        
        // Attacher les informations utilisateur à la requête
        req.userId = user.id;
        req.username = user.username;
        next();
    });
};

// Middleware optionnel d'authentification (ne bloque pas si pas de token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.userId = user.id;
                req.username = user.username;
            }
        });
    }
    
    next();
};

// Fonction pour générer un JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username 
        },
        JWT_SECRET,
        { 
            expiresIn: '24h' // Token valide 24h
        }
    );
};

// Fonction pour vérifier la propriété d'une ressource
const checkOwnership = (resource, userId) => {
    return resource.authorId === userId;
};

module.exports = {
    authenticateToken,
    optionalAuth,
    generateToken,
    checkOwnership,
    JWT_SECRET
};
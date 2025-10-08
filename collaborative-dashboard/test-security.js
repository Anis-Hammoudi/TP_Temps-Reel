// Script de test pour valider les fonctionnalités de sécurité
// À exécuter avec : node test-security.js

const axios = require('axios').default;
const BASE_URL = 'http://localhost:3000/api';

// Fonction utilitaire pour les logs colorés
const log = {
    info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
    success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
    error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
    warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`)
};

async function runSecurityTests() {
    console.log('\n🔒 Tests de sécurité de l\'application collaborative\n');
    
    let userAToken = null;
    let userBToken = null;
    let noteId = null;
    
    try {
        // Test 1 : Tentative d'accès non autorisé
        log.info('Test 1 : Tentative de création de note sans authentification');
        try {
            await axios.post(`${BASE_URL}/notes`, { content: 'Note non autorisée' });
            log.error('ÉCHEC - La création devrait être refusée');
        } catch (error) {
            if (error.response?.status === 401) {
                log.success('RÉUSSI - Accès correctement refusé (401)');
            } else {
                log.error(`ÉCHEC - Code d'erreur inattendu: ${error.response?.status}`);
            }
        }
        
        // Test 2 : Inscription utilisateur A
        log.info('Test 2 : Inscription utilisateur A');
        try {
            const response = await axios.post(`${BASE_URL}/register`, {
                username: 'testUserA',
                password: 'motdepasse123'
            });
            userAToken = response.data.token;
            log.success(`RÉUSSI - Utilisateur A créé avec token: ${userAToken.substring(0, 20)}...`);
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
            return;
        }
        
        // Test 3 : Inscription utilisateur B
        log.info('Test 3 : Inscription utilisateur B');
        try {
            const response = await axios.post(`${BASE_URL}/register`, {
                username: 'testUserB',
                password: 'motdepasse456'
            });
            userBToken = response.data.token;
            log.success(`RÉUSSI - Utilisateur B créé avec token: ${userBToken.substring(0, 20)}...`);
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
            return;
        }
        
        // Test 4 : Création de note par utilisateur A
        log.info('Test 4 : Création de note par utilisateur A');
        try {
            const response = await axios.post(`${BASE_URL}/notes`, 
                { content: 'Note privée de l\'utilisateur A' },
                { headers: { Authorization: `Bearer ${userAToken}` } }
            );
            noteId = response.data.id;
            log.success(`RÉUSSI - Note créée avec ID: ${noteId}`);
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
            return;
        }
        
        // Test 5 : Tentative de modification par utilisateur B
        log.info('Test 5 : Tentative de modification de la note de A par B');
        try {
            await axios.put(`${BASE_URL}/notes/${noteId}`,
                { content: 'Tentative de modification par B' },
                { headers: { Authorization: `Bearer ${userBToken}` } }
            );
            log.error('ÉCHEC - La modification devrait être refusée');
        } catch (error) {
            if (error.response?.status === 403) {
                log.success('RÉUSSI - Modification correctement refusée (403)');
            } else {
                log.error(`ÉCHEC - Code d'erreur inattendu: ${error.response?.status}`);
            }
        }
        
        // Test 6 : Tentative de suppression par utilisateur B
        log.info('Test 6 : Tentative de suppression de la note de A par B');
        try {
            await axios.delete(`${BASE_URL}/notes/${noteId}`,
                { headers: { Authorization: `Bearer ${userBToken}` } }
            );
            log.error('ÉCHEC - La suppression devrait être refusée');
        } catch (error) {
            if (error.response?.status === 403) {
                log.success('RÉUSSI - Suppression correctement refusée (403)');
            } else {
                log.error(`ÉCHEC - Code d'erreur inattendu: ${error.response?.status}`);
            }
        }
        
        // Test 7 : Modification légitime par utilisateur A
        log.info('Test 7 : Modification légitime par utilisateur A');
        try {
            const response = await axios.put(`${BASE_URL}/notes/${noteId}`,
                { content: 'Note modifiée par son propriétaire' },
                { headers: { Authorization: `Bearer ${userAToken}` } }
            );
            log.success('RÉUSSI - Modification autorisée pour le propriétaire');
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
        }
        
        // Test 8 : Lecture des notes (sans authentification)
        log.info('Test 8 : Lecture des notes sans authentification');
        try {
            const response = await axios.get(`${BASE_URL}/notes`);
            log.success(`RÉUSSI - ${response.data.length} note(s) lue(s) sans authentification`);
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
        }
        
        // Test 9 : Token invalide
        log.info('Test 9 : Utilisation d\'un token invalide');
        try {
            await axios.post(`${BASE_URL}/notes`,
                { content: 'Note avec token invalide' },
                { headers: { Authorization: 'Bearer token-invalide' } }
            );
            log.error('ÉCHEC - L\'accès devrait être refusé');
        } catch (error) {
            if (error.response?.status === 403) {
                log.success('RÉUSSI - Token invalide correctement rejeté (403)');
            } else {
                log.error(`ÉCHEC - Code d'erreur inattendu: ${error.response?.status}`);
            }
        }
        
        // Test 10 : Nettoyage - Suppression par le propriétaire
        log.info('Test 10 : Suppression de la note par son propriétaire');
        try {
            await axios.delete(`${BASE_URL}/notes/${noteId}`,
                { headers: { Authorization: `Bearer ${userAToken}` } }
            );
            log.success('RÉUSSI - Suppression autorisée pour le propriétaire');
        } catch (error) {
            log.error(`ÉCHEC - ${error.response?.data?.error || error.message}`);
        }
        
        console.log('\n✅ Tests de sécurité terminés !');
        console.log('📊 Vérifiez les logs ci-dessus pour identifier les éventuels problèmes.');
        
    } catch (error) {
        log.error(`Erreur générale: ${error.message}`);
    }
}

// Vérifier que le serveur est accessible
async function checkServerStatus() {
    try {
        await axios.get('http://localhost:3000');
        log.success('Serveur accessible sur http://localhost:3000');
        return true;
    } catch (error) {
        log.error('Serveur non accessible. Assurez-vous qu\'il est démarré avec "npm start"');
        return false;
    }
}

// Exécution principale
async function main() {
    const serverOk = await checkServerStatus();
    if (serverOk) {
        await runSecurityTests();
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    log.error(`Erreur non gérée: ${reason}`);
    process.exit(1);
});

main();
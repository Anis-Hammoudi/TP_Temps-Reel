// Configuration et variables globales
const API_BASE = '/api';
let socket;
let notes = [];
let currentEditingNoteId = null;
let currentUser = null;
let authToken = null;

// Éléments DOM
const elements = {
    noteContent: document.getElementById('noteContent'),
    addNoteBtn: document.getElementById('addNoteBtn'),
    notesContainer: document.getElementById('notesContainer'),
    notesCount: document.getElementById('notesCount'),
    charCount: document.getElementById('charCount'),
    emptyState: document.getElementById('emptyState'),
    statusText: document.getElementById('statusText'),
    statusIndicator: document.getElementById('statusIndicator'),
    
    // Authentification
    authForms: document.getElementById('authForms'),
    userInfo: document.getElementById('userInfo'),
    currentUsername: document.getElementById('currentUsername'),
    authRequired: document.getElementById('authRequired'),
    noteFormSection: document.getElementById('noteFormSection'),
    
    // Formulaires
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginBtn: document.getElementById('loginBtn'),
    registerUsername: document.getElementById('registerUsername'),
    registerPassword: document.getElementById('registerPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    registerBtn: document.getElementById('registerBtn'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Modal d'édition
    editModal: document.getElementById('editModal'),
    editNoteContent: document.getElementById('editNoteContent'),
    editCharCount: document.getElementById('editCharCount'),
    closeEditModal: document.getElementById('closeEditModal'),
    cancelEdit: document.getElementById('cancelEdit'),
    saveEdit: document.getElementById('saveEdit')
};

// Utilitaires d'authentification
function getStoredAuth() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('currentUsername');
    return { token, username };
}

function saveAuth(token, username) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUsername', username);
    authToken = token;
    currentUser = username;
}

function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUsername');
    authToken = null;
    currentUser = null;
}

// Gestion de l'interface d'authentification
function showAuthForm(formType) {
    if (formType === 'register') {
        elements.loginForm.style.display = 'none';
        elements.registerForm.style.display = 'block';
    } else {
        elements.registerForm.style.display = 'none';
        elements.loginForm.style.display = 'block';
    }
}

function showMainApp() {
    elements.authForms.style.display = 'none';
    elements.userInfo.style.display = 'flex';
    elements.authRequired.style.display = 'none';
    elements.noteFormSection.style.display = 'block';
    elements.currentUsername.textContent = currentUser;
}

function showAuthRequired() {
    elements.authForms.style.display = 'block';
    elements.userInfo.style.display = 'none';
    elements.authRequired.style.display = 'block';
    elements.noteFormSection.style.display = 'none';
}

// Fonction de connexion
async function login() {
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value;
    
    if (!username || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveAuth(data.token, data.user.username);
            showMainApp();
            connectSocket();
            loadNotes();
            showMessage('Connexion réussie', 'success');
            
            // Reset form
            elements.loginUsername.value = '';
            elements.loginPassword.value = '';
        } else {
            showMessage(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Fonction d'inscription
async function register() {
    const username = elements.registerUsername.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    if (!username || !password || !confirmPassword) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveAuth(data.token, data.user.username);
            showMainApp();
            connectSocket();
            loadNotes();
            showMessage('Inscription réussie', 'success');
            
            // Reset form
            elements.registerUsername.value = '';
            elements.registerPassword.value = '';
            elements.confirmPassword.value = '';
        } else {
            showMessage(data.error || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        showMessage('Erreur d\'inscription', 'error');
    }
}

// Fonction de déconnexion
function logout() {
    clearAuth();
    if (socket) {
        socket.disconnect();
    }
    showAuthRequired();
    notes = [];
    renderNotes();
    showMessage('Déconnexion réussie', 'info');
}

// Connexion Socket.IO
function connectSocket() {
    if (!authToken) return;
    
    socket = io({
        auth: {
            token: authToken
        }
    });
    
    socket.on('connect', () => {
        console.log('Connecté au serveur Socket.IO');
        updateStatus('Connecté', 'connected');
    });
    
    socket.on('disconnect', () => {
        console.log('Déconnecté du serveur Socket.IO');
        updateStatus('Déconnecté', 'disconnected');
    });
    
    socket.on('notes_updated', (updatedNotes) => {
        notes = updatedNotes;
        renderNotes();
    });
    
    socket.on('authError', (error) => {
        console.error('Erreur d\'authentification Socket.IO:', error);
        showMessage('Erreur d\'authentification temps réel', 'error');
        logout();
    });
}

// Chargement des notes
async function loadNotes() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            notes = await response.json();
            renderNotes();
        } else if (response.status === 401) {
            showMessage('Session expirée, veuillez vous reconnecter', 'error');
            logout();
        } else {
            showMessage('Erreur lors du chargement des notes', 'error');
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Ajout d'une nouvelle note
async function addNote() {
    const content = elements.noteContent.value.trim();
    
    if (!content) {
        showMessage('Veuillez saisir du contenu', 'error');
        return;
    }
    
    if (!authToken) {
        showMessage('Vous devez être connecté', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            elements.noteContent.value = '';
            updateCharCount();
            showMessage('Note ajoutée avec succès', 'success');
        } else if (response.status === 401) {
            showMessage('Session expirée, veuillez vous reconnecter', 'error');
            logout();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de l\'ajout', 'error');
        }
    } catch (error) {
        console.error('Erreur d\'ajout:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Modification d'une note
function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    if (note.authorName !== currentUser) {
        showMessage('Vous ne pouvez modifier que vos propres notes', 'error');
        return;
    }
    
    currentEditingNoteId = noteId;
    elements.editNoteContent.value = note.content;
    elements.editModal.style.display = 'flex';
    elements.editNoteContent.focus();
    updateEditCharCount();
}

// Sauvegarde des modifications
async function saveEdit() {
    const content = elements.editNoteContent.value.trim();
    
    if (!content) {
        showMessage('Le contenu ne peut pas être vide', 'error');
        return;
    }
    
    if (!authToken || !currentEditingNoteId) return;
    
    try {
        const response = await fetch(`${API_BASE}/notes/${currentEditingNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            closeEditModal();
            showMessage('Note modifiée avec succès', 'success');
        } else if (response.status === 401) {
            showMessage('Session expirée, veuillez vous reconnecter', 'error');
            logout();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur de modification:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Suppression d'une note
async function deleteNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    if (note.authorName !== currentUser) {
        showMessage('Vous ne pouvez supprimer que vos propres notes', 'error');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        return;
    }
    
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showMessage('Note supprimée avec succès', 'success');
        } else if (response.status === 401) {
            showMessage('Session expirée, veuillez vous reconnecter', 'error');
            logout();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur de suppression:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Fermeture du modal d'édition
function closeEditModal() {
    elements.editModal.style.display = 'none';
    currentEditingNoteId = null;
    elements.editNoteContent.value = '';
}

// Mise à jour du compteur de caractères
function updateCharCount() {
    const count = elements.noteContent.value.length;
    elements.charCount.textContent = `${count}/500`;
}

function updateEditCharCount() {
    const count = elements.editNoteContent.value.length;
    elements.editCharCount.textContent = `${count}/500`;
}

// Affichage des notes
function renderNotes() {
    if (notes.length === 0) {
        elements.notesContainer.style.display = 'none';
        elements.emptyState.style.display = 'block';
    } else {
        elements.emptyState.style.display = 'none';
        elements.notesContainer.style.display = 'block';
        
        elements.notesContainer.innerHTML = notes.map(note => {
            const canEdit = note.authorName === currentUser;
            const timeAgo = getTimeAgo(new Date(note.createdAt));
            
            console.log('Debug render:', { 
                noteAuthor: note.authorName, 
                currentUser: currentUser, 
                canEdit: canEdit,
                noteId: note.id
            });
            
            return `
                <div class="note-card" data-note-id="${note.id}">
                    <div class="note-header">
                        <div class="note-author">
                            <span class="author-name">${note.authorName}</span>
                            <span class="note-time">${timeAgo}</span>
                        </div>
                        <div class="note-status">
                            ${canEdit ? '<span class="owner-badge">Vous</span>' : '<span class="readonly-badge">Lecture seule</span>'}
                        </div>
                    </div>
                    <div class="note-content">${escapeHtml(note.content)}</div>
                    <div class="note-actions">
                        ${canEdit ? `
                            <button class="btn btn-edit" onclick="editNote(${note.id})">
                                Modifier
                            </button>
                            <button class="btn btn-danger" onclick="deleteNote(${note.id})">
                                Supprimer
                            </button>
                        ` : `
                            <div class="read-only-notice">
                                Lecture seule
                            </div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    elements.notesCount.textContent = notes.length;
}

// Utilitaires
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'à l\'instant';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStatus(text, status) {
    elements.statusText.textContent = text;
    elements.statusIndicator.className = `status-indicator ${status}`;
}

function showMessage(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Ajouter au body
    document.body.appendChild(notification);
    
    // Animer l'apparition
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification existante
    const stored = getStoredAuth();
    if (stored.token && stored.username) {
        authToken = stored.token;
        currentUser = stored.username;
        showMainApp();
        connectSocket();
        loadNotes();
    } else {
        showAuthRequired();
    }
    
    // Événements d'authentification
    elements.loginBtn.addEventListener('click', login);
    elements.registerBtn.addEventListener('click', register);
    elements.logoutBtn.addEventListener('click', logout);
    elements.showRegister.addEventListener('click', () => showAuthForm('register'));
    elements.showLogin.addEventListener('click', () => showAuthForm('login'));
    
    // Événements des formulaires
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
    
    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });
    
    // Événements des notes
    elements.addNoteBtn.addEventListener('click', addNote);
    elements.noteContent.addEventListener('input', updateCharCount);
    elements.editNoteContent.addEventListener('input', updateEditCharCount);
    
    // Événements du modal
    elements.closeEditModal.addEventListener('click', closeEditModal);
    elements.cancelEdit.addEventListener('click', closeEditModal);
    elements.saveEdit.addEventListener('click', saveEdit);
    
    // Fermer le modal en cliquant à l'extérieur
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) {
            closeEditModal();
        }
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.editModal.style.display === 'flex') {
            closeEditModal();
        }
    });
    
    // Entrée pour ajouter une note (Ctrl+Enter)
    elements.noteContent.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            addNote();
        }
    });
    
    // Entrée pour sauvegarder l'édition (Ctrl+Enter)
    elements.editNoteContent.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
    });
    
    // Initialiser les compteurs
    updateCharCount();
    updateEditCharCount();
});
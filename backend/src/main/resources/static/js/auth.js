// js/auth.js
// Authentication Client

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<Object>} User data with JWT token
 */
async function register(username, email, password) {
    try {
        const response = await api.auth.register(username, email, password);
        
        // Backend returns { token: "jwt...", user: { id, username, email, role } }
        if (response.token && response.user) {
            // Update app state with token and user
            setState({
                jwtToken: response.token,
                currentUser: response.user,
                isAuthenticated: true
            });
            
            return response;
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login existing user
 * @param {string} email - Email or username
 * @param {string} password - Password
 * @returns {Promise<Object>} User data with JWT token
 */
async function login(email, password) {
    try {
        const response = await api.auth.login(email, password);
        
        // Backend returns { token: "jwt...", user: { id, username, email, role } }
        if (response.token && response.user) {
            // Update app state with token and user
            setState({
                jwtToken: response.token,
                currentUser: response.user,
                isAuthenticated: true
            });
            
            return response;
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout current user
 */
function logout() {
    // Clear state (removes from localStorage too)
    clearState();
    
    // Navigate to login page
    navigateTo('/login');
}

/**
 * Get current authenticated user from backend
 * Useful for refreshing user data or validating JWT
 * @returns {Promise<Object>} Current user data
 */
async function getCurrentUser() {
    try {
        const user = await api.auth.getCurrentUser();
        
        // Update current user in state
        setState({
            currentUser: user,
            isAuthenticated: true
        });
        
        return user;
    } catch (error) {
        console.error('Get current user error:', error);
        
        // If token is invalid, clear state
        if (error.message.includes('401') || error.message.includes('403')) {
            clearState();
        }
        
        throw error;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    return appState.isAuthenticated && appState.jwtToken !== null;
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check (e.g., 'CREATOR', 'ADMIN')
 * @returns {boolean} True if user has the role
 */
function hasRole(role) {
    return appState.currentUser?.role === role;
}

/**
 * Verify JWT token is still valid
 * Calls backend to check token validity
 * @returns {Promise<boolean>} True if token is valid
 */
async function verifyToken() {
    if (!appState.jwtToken) {
        return false;
    }
    
    try {
        await getCurrentUser();
        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
}

/**
 * Initialize auth on app startup
 * Verifies stored JWT token if present
 */
async function initAuth() {
    // Check if token exists in localStorage
    if (appState.jwtToken && appState.currentUser) {
        try {
            // Verify token is still valid
            await getCurrentUser();
            console.log('Auth initialized - User logged in:', appState.currentUser.username);
        } catch (error) {
            console.warn('Stored token is invalid, clearing auth state');
            clearState();
        }
    }
}

// Make functions globally available
window.register = register;
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.hasRole = hasRole;
window.verifyToken = verifyToken;
window.initAuth = initAuth;

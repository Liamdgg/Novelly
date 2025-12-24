// Central data store
const appState = {
    currentUser: null,      // { id, email, username, role, ... }
    novels: [],             // All novels from API
    bookmarks: [],          // User's bookmarked novels
    readingHistory: [],     // Continue reading data
    currentNovel: null,     // Currently viewing novel
    currentChapter: null,   // Currently reading chapter
    jwtToken: null,         // Auth token
    isAuthenticated: false
};

// Pub/Sub pattern: list of listener functions
const listeners = [];

// Subscribe to state changes
function subscribe(listener) {
    listeners.push(listener);
    return () => {
        // Return unsubscribe function
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
}

// Update state and notify all listeners
function setState(newState) {
    // Merge new state into appState
    Object.assign(appState, newState);
    
    // Save token to localStorage if it changed
    if (newState.jwtToken !== undefined) {
        if (newState.jwtToken) {
            localStorage.setItem('jwtToken', newState.jwtToken);
        } else {
            localStorage.removeItem('jwtToken');
        }
    }
    
    // Save currentUser to localStorage if it changed
    if (newState.currentUser !== undefined) {
        if (newState.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(newState.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }
    
    // Notify all subscribers
    listeners.forEach(listener => listener(appState));
}

// Get current state (read-only)
function getState() {
    return { ...appState }; // Return copy to prevent direct mutation
}

// Initialize state from localStorage
function initializeState() {
    const savedToken = localStorage.getItem('jwtToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        try {
            const user = JSON.parse(savedUser);
            setState({
                jwtToken: savedToken,
                currentUser: user,
                isAuthenticated: true
            });
        } catch (error) {
            console.error('Error parsing saved user:', error);
            // Clear invalid data
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('currentUser');
        }
    }
    
    // Initialize bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
        try {
            const bookmarks = JSON.parse(savedBookmarks);
            setState({ bookmarks });
        } catch (error) {
            console.error('Error parsing bookmarks:', error);
        }
    }
}

// Initialize on load
initializeState();

// Clear state (logout)
function clearState() {
    setState({
        currentUser: null,
        jwtToken: null,
        isAuthenticated: false,
        bookmarks: [],
        readingHistory: []
    });
}



function initializeApp() {
    console.log('Initializing Novelly...');
    
    // Initialize router (handles all page rendering)
    initRouter();
    
    console.log('App initialized successfully');
}

// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

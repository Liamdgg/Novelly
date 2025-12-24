// js/components/library.js
// Library Page Renderer

function renderLibrary() {
    return `
        ${renderHeader()}
        <main class="library-page">
            <div class="library-container">
                <h1>My Library</h1>
                <p class="library-subtitle">Your saved novels</p>
                
                <div id="library-content" class="library-content">
                    <div id="library-tab" class="novels-grid">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </main>
    `;
}

// Initialize library page
function initrenderLibrary() {
    initHeader();
    loadLibraryNovels();
}

// Load library novels
async function loadLibraryNovels() {
    const container = document.getElementById('library-tab');
    if (!container) return;
    
    try {
        if (!appState.currentUser) {
            container.innerHTML = '<p class="empty-message">Please log in to view your library.</p>';
            return;
        }
        
        // Show loading
        container.innerHTML = Spinner({ message: 'Loading library...' });
        
        // Fetch library items from API
        const response = await fetch(`/api/users/${appState.currentUser.userId}/library`, {
            headers: {
                'Authorization': `Bearer ${appState.jwtToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load library');
        }
        
        const libraryItems = await response.json();
        
        if (!libraryItems || libraryItems.length === 0) {
            container.innerHTML = '<p class="empty-message">No novels in your library yet. Click "Add to Library" on any novel page!</p>';
            return;
        }
        
        // Extract novels from library items and render with remove buttons
        const novels = libraryItems.map(item => item.novel);
        container.innerHTML = novels.map(novel => createNovelCard(novel, { showRemoveButton: true })).join('');
        
    } catch (error) {
        console.error('Error loading library:', error);
        container.innerHTML = '<p class="error-message">Failed to load library</p>';
    }
}

// Remove novel from library
window.removeFromLibrary = async function(novelId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (!appState.currentUser) {
        showToast('Please log in first', 'error');
        return;
    }
    
    if (!confirm('Remove this novel from your library?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${appState.currentUser.userId}/library/${novelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${appState.jwtToken}`
            }
        });
        
        if (response.ok) {
            showToast('Removed from library', 'success');
            // Reload library
            loadLibraryNovels();
        } else {
            throw new Error('Failed to remove from library');
        }
    } catch (error) {
        console.error('Error removing from library:', error);
        showToast('Failed to remove from library', 'error');
    }
};



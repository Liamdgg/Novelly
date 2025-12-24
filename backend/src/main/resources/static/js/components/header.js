function renderHeader() {
    const user = appState.currentUser;
    const isLoggedIn = appState.isAuthenticated;
    
    return `
        <header class="app-header">
            <div class="header-container">
                <!-- Logo -->
                <div class="header-logo" onclick="navigateTo('/home')">
                    <span class="logo-text">Novelly</span>
                </div>
                
                <!-- Search Bar -->
                <div class="header-search">
                    <input 
                        type="text" 
                        id="global-search" 
                        class="search-input" 
                        placeholder="Search novels, authors..."
                        onkeypress="handleSearchKeyPress(event)"
                        autocomplete="off"
                    />
                    <button class="search-btn" onclick="handleSearch()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                    <!-- Search Suggestions Dropdown -->
                    <div id="search-suggestions" class="search-suggestions hidden"></div>
                </div>
                
                <!-- User Menu -->
                <div class="header-user">
                    ${isLoggedIn ? renderUserMenu(user) : renderGuestMenu()}
                </div>
            </div>
        </header>
        
        <!-- Navbar below header -->
        ${isLoggedIn ? renderNavbar(user) : ''}
    `;
}

// Not Log In
function renderGuestMenu() {
    return `
        <div class="guest-menu">
            <button class=\"btn btn-secondary btn-sm\" onclick=\"navigateTo('#/login')\">
                Log In
            </button>
            <button class=\"btn btn-primary btn-sm\" onclick=\"navigateTo('#/register')\">
                Sign Up
            </button>
        </div>
    `;
}

// Logged In
function renderUserMenu(user) {
    // Safety check for null user
    if (!user) {
        return renderGuestMenu();
    }
    
    return `
        <div class="user-menu">
            <button class="user-menu-btn" onclick="toggleUserDropdown()">
                <span class="user-avatar">
                    ${user.avatar ? `<img src="${user.avatar}" alt="${user.username}">` : getUserInitials(user.username || 'U')}
                </span>
                <span class="user-name">${user.username || 'User'}</span>
                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div id="user-dropdown" class="user-dropdown hidden">
                <div class="dropdown-header">
                    <p class="dropdown-email">${user.email}</p>
                    <p class="dropdown-role">${user.role}</p>
                </div>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" onclick="navigateTo('/profile')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                </a>
                <a class="dropdown-item" onclick="navigateTo('/library')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    My Library
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item dropdown-item-danger" onclick="handleLogout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </a>
            </div>
        </div>
    `;
}

// Get user initials from username
function getUserInitials(username) {
    if (!username) return 'U';
    
    const parts = username.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;
    
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    if (dropdown.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeDropdownOnClickOutside);
        }, 0);
    }
}

// Close dropdown when clicking outside
function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('user-dropdown');
    const menuBtn = document.querySelector('.user-menu-btn');
    
    if (!dropdown || !menuBtn) return;
    
    // Check if click is outside dropdown and button
    if (!dropdown.contains(event.target) && !menuBtn.contains(event.target)) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeDropdownOnClickOutside);
    }
}

function renderNavbar(user) {
    const currentPath = window.location.hash.slice(1) || '/home';
    const isCreator = user && user.role === 'ADMIN';
    
    return `
        <nav class="app-navbar">
            <div class="navbar-container">
                <a class="navbar-link ${currentPath === '/home' ? 'active' : ''}" 
                   onclick="navigateTo('/home')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Home</span>
                </a>
                
                <a class="navbar-link ${currentPath === '/library' ? 'active' : ''}" 
                   onclick="navigateTo('/library')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span>Library</span>
                </a>
                
                ${isCreator ? `
                    <a class="navbar-link ${currentPath === '/admin' ? 'active' : ''}" 
                       onclick="navigateTo('/admin')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.2-13.2 4.2 4.2m-4.2 8.2 4.2-4.2M1 12h6m6 0h6m-13.2 5.2 4.2-4.2m8.2 0 4.2 4.2"></path>
                        </svg>
                        <span>Admin</span>
                    </a>
                ` : ''}
            </div>
        </nav>
    `;
}

// Handle search input
function handleSearch() {
    const input = document.getElementById('global-search');
    const query = input.value.trim();
    
    if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
    }
    
    if (query.length < 2) {
        showToast('Search term must be at least 2 characters', 'warning');
        return;
    }
    
    // Show search results immediately in a modal or navigate to search page with immediate results
    performGlobalSearch(query);
}

// Handle Enter key in search box
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// Perform global search and navigate to results
async function performGlobalSearch(query) {
    try {
        showSpinner('Searching...');
        
        // Fetch search results
        const response = await api.novels.getAll(0, 50, query);
        // Backend returns List<Novel> directly (array), not paginated response
        const results = Array.isArray(response) ? response : [];
        
        hideSpinner();
        
        // Navigate to search page with results already loaded
        // Store results temporarily in appState for search page to use
        appState.searchResults = results;
        appState.searchQuery = query;
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
        
    } catch (error) {
        hideSpinner();
        console.error('Search error:', error);
        showToast('Search failed. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) {
        return;
    }
    
    // Clear state
    clearState();
    
    // Show success message
    showToast('Logged out successfully', 'success');
    
    // Redirect to login
    setTimeout(() => {
        navigateTo('/login');
    }, 1000);
}

// Initialize header (called after render)
function initHeader() {
    // Setup search suggestions
    setupSearchSuggestions();
    
    // Close dropdown on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdownOnClickOutside);
            }
            
            // Close search suggestions
            const suggestions = document.getElementById('search-suggestions');
            if (suggestions) {
                suggestions.classList.add('hidden');
            }
        }
    });
}

// Search suggestions with debounce
let searchSuggestionsTimer = null;

function setupSearchSuggestions() {
    const searchInput = document.getElementById('global-search');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    if (!searchInput || !suggestionsDiv) return;
    
    // Disable auto-suggestions - only search on Enter or button click
    // Just hide suggestions on blur
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsDiv.classList.add('hidden');
        }, 200);
    });
}

async function fetchSearchSuggestions(query) {
    const suggestionsDiv = document.getElementById('search-suggestions');
    if (!suggestionsDiv) return;
    
    try {
        // Call API search with limit
        const response = await api.novels.getAll(0, 5, query);
        // Backend returns List<Novel> directly (array), not paginated response
        const results = Array.isArray(response) ? response : [];
        
        if (results.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        // Render suggestions (support both mockData and backend DTO field names)
        suggestionsDiv.innerHTML = results.map(novel => {
            const id = novel.novelId || novel.id;
            const cover = novel.coverImageUrl || novel.coverImage || 'assets/placeholder.png';
            return `
                <div class="suggestion-item" onclick="navigateTo('#/reader/${id}/1')">
                    <img src="${cover}" alt="${novel.title}" />
                    <div class="suggestion-info">
                        <div class="suggestion-title">${highlightText(novel.title, query)}</div>
                        <div class="suggestion-author">${highlightText(novel.author, query)}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        suggestionsDiv.classList.remove('hidden');
        
    } catch (error) {
        console.error('Search suggestions error:', error);
        suggestionsDiv.classList.add('hidden');
    }
}

// Make functions globally available
window.toggleUserDropdown = toggleUserDropdown;
window.handleSearch = handleSearch;
window.handleSearchKeyPress = handleSearchKeyPress;
window.handleLogout = handleLogout;


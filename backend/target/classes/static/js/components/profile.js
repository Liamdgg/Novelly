// js/components/profile.js
// Profile Page Renderer

function renderProfile() {
    const user = appState.currentUser || {};
    
    return `
        ${renderHeader()}
        <main class="profile-page">
            <div class="profile-container">
                <h1>My Profile</h1>
                
                <div class="profile-card">
                    <div class="profile-avatar">
                        <div class="avatar-placeholder">${(user.username || 'U').charAt(0).toUpperCase()}</div>
                    </div>
                    
                    <div class="profile-info">
                        <h2>${user.username || 'User'}</h2>
                        <p class="profile-email">${user.email || 'email@example.com'}</p>
                        <p class="profile-role">Role: ${user.role || 'USER'}</p>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="handleEditProfile()">Edit Profile</button>
                        <button class="btn btn-danger" onclick="handleLogout()">Logout</button>
                    </div>
                </div>
            </div>
        </main>
    `;
}

function initrenderProfile() {
    initHeader();
}

function handleEditProfile() {
    navigateTo('#/edit-profile');
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        setState({
            currentUser: null,
            jwtToken: null,
            isAuthenticated: false
        });
        navigateTo('#/login');
    }
}

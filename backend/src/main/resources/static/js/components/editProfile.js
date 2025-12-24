// js/components/editProfile.js
// Edit Profile Page

function renderEditProfile() {
    const user = appState.currentUser || {};
    
    return `
        ${renderHeader()}
        <main class="profile-page">
            <div class="profile-container">
                <h1>Edit Profile</h1>
                
                <form id="edit-profile-form" class="edit-profile-form">
                    <!-- Avatar Section -->
                    <div class="form-section">
                        <h3>Profile Picture</h3>
                        <div class="avatar-upload">
                            <div class="current-avatar">
                                <div class="avatar-placeholder" id="preview-avatar">
                                    ${(user.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div class="avatar-controls">
                                <input type="file" id="avatar-input" accept="image/*" style="display: none;" />
                                <button type="button" class="btn btn-secondary" onclick="document.getElementById('avatar-input').click()">
                                    Choose Image
                                </button>
                                <p class="hint">JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Username Section -->
                    <div class="form-section">
                        <h3>Username</h3>
                        <div class="form-group">
                            <label for="edit-username">Username</label>
                            <input 
                                type="text" 
                                id="edit-username" 
                                name="username" 
                                value="${user.username || ''}"
                                placeholder="Enter new username"
                            />
                            <div class="error-message" id="edit-username-error"></div>
                        </div>
                    </div>
                    
                    <!-- Password Section -->
                    <div class="form-section">
                        <h3>Change Password</h3>
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input 
                                type="password" 
                                id="current-password" 
                                name="currentPassword" 
                                placeholder="Enter current password"
                            />
                            <div class="error-message" id="current-password-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input 
                                type="password" 
                                id="new-password" 
                                name="newPassword" 
                                placeholder="Enter new password (min 8 chars)"
                            />
                            <div class="error-message" id="new-password-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-new-password">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="confirm-new-password" 
                                name="confirmPassword" 
                                placeholder="Confirm new password"
                            />
                            <div class="error-message" id="confirm-new-password-error"></div>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="navigateTo('#/profile')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </main>
    `;
}

function initrenderEditProfile() {
    initHeader();
    setupAvatarPreview();
    setupEditProfileForm();
}

// Setup avatar preview
function setupAvatarPreview() {
    const avatarInput = document.getElementById('avatar-input');
    const previewAvatar = document.getElementById('preview-avatar');
    
    if (avatarInput && previewAvatar) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Image must be less than 2MB', 'error');
                    return;
                }
                
                // Preview image
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewAvatar.style.backgroundImage = `url(${event.target.result})`;
                    previewAvatar.style.backgroundSize = 'cover';
                    previewAvatar.textContent = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Setup form handlers
function setupEditProfileForm() {
    const form = document.getElementById('edit-profile-form');
    if (form) {
        form.addEventListener('submit', handleEditProfileSubmit);
        
        // Real-time validation
        const usernameInput = document.getElementById('edit-username');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-new-password');
        
        if (usernameInput) {
            usernameInput.addEventListener('input', () => clearEditError('edit-username'));
        }
        
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => clearEditError('new-password'));
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => clearEditError('confirm-new-password'));
        }
    }
}

// Handle form submission
async function handleEditProfileSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('edit-username').value.trim();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const avatarFile = document.getElementById('avatar-input').files[0];
    
    clearAllEditErrors();
    
    let hasError = false;
    let hasChanges = false;
    
    // Validate username if changed
    if (username && username !== appState.currentUser?.username) {
        const validation = validateUsername(username);
        if (!validation.isValid) {
            showEditError('edit-username', validation.message);
            hasError = true;
        }
        hasChanges = true;
    }
    
    // Validate password change if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            showEditError('current-password', 'Current password is required');
            hasError = true;
        }
        
        if (!newPassword) {
            showEditError('new-password', 'New password is required');
            hasError = true;
        } else {
            const passwordValidation = validateStrongPassword(newPassword);
            if (!passwordValidation.isValid) {
                showEditError('new-password', passwordValidation.message);
                hasError = true;
            }
        }
        
        if (newPassword !== confirmPassword) {
            showEditError('confirm-new-password', 'Passwords do not match');
            hasError = true;
        }
        
        hasChanges = true;
    }
    
    if (avatarFile) {
        hasChanges = true;
    }
    
    if (!hasChanges) {
        showToast('No changes to save', 'info');
        return;
    }
    
    if (hasError) {
        return;
    }
    
    showSpinner('Saving changes...');
    
    try {
        // TODO: API call to update profile
        // const formData = new FormData();
        // if (username) formData.append('username', username);
        // if (newPassword) formData.append('password', newPassword);
        // if (avatarFile) formData.append('avatar', avatarFile);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update state
        setState({
            currentUser: {
                ...appState.currentUser,
                username: username || appState.currentUser.username
            }
        });
        
        hideSpinner();
        showToast('Profile updated successfully!', 'success');
        navigateTo('#/profile');
        
    } catch (error) {
        hideSpinner();
        console.error('Profile update error:', error);
        showToast(error.message || 'Failed to update profile', 'error');
    }
}

// Error handling helpers
function showEditError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + '-error');
    
    if (input) input.classList.add('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
}

function clearEditError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + '-error');
    
    if (input) input.classList.remove('error');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
}

function clearAllEditErrors() {
    ['edit-username', 'current-password', 'new-password', 'confirm-new-password'].forEach(clearEditError);
}

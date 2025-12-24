// js/components/register.js
// Register Page Renderer

function renderRegister() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Join Novelly</h1>
                    <p>Create an account to start reading</p>
                </div>
                
                <form id="register-form" class="auth-form">
                    <div class="form-group">
                        <label for="register-username">Username</label>
                        <input 
                            type="text" 
                            id="register-username" 
                            name="username" 
                            placeholder="Choose a username"
                            required 
                        />
                        <div class="error-message" id="register-username-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-email">Email</label>
                        <input 
                            type="email" 
                            id="register-email" 
                            name="email" 
                            placeholder="Enter your email"
                            required 
                        />
                        <div class="error-message" id="register-email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password">Password</label>
                        <input 
                            type="password" 
                            id="register-password" 
                            name="password" 
                            placeholder="Create a password (min 8 chars, uppercase, lowercase, number)"
                            required 
                        />
                        <div class="error-message" id="register-password-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-confirm">Confirm Password</label>
                        <input 
                            type="password" 
                            id="register-confirm" 
                            name="confirmPassword" 
                            placeholder="Confirm your password"
                            required 
                        />
                        <div class="error-message" id="register-confirm-error"></div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Register
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>Already have an account? <a href="#/login">Login here</a></p>
                </div>
            </div>
        </div>
    `;
}

// Initialize register form event handlers
function initrenderRegister() {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
        
        // Add real-time validation
        const usernameInput = document.getElementById('register-username');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmInput = document.getElementById('register-confirm');
        
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => validateField('username'));
            usernameInput.addEventListener('input', () => clearFieldError('register-username'));
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => validateField('email'));
            emailInput.addEventListener('input', () => clearFieldError('register-email'));
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', () => validateField('password'));
            passwordInput.addEventListener('input', () => {
                clearFieldError('register-password');
                validateField('password');
            });
        }
        
        if (confirmInput) {
            confirmInput.addEventListener('blur', () => validateField('confirm'));
            confirmInput.addEventListener('input', () => clearFieldError('register-confirm'));
        }
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Clear all errors first
    clearAllErrors();
    
    let hasError = false;
    
    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        showRegisterError('register-username', usernameValidation.message);
        hasError = true;
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        showRegisterError('register-email', emailValidation.message);
        hasError = true;
    }
    
    // Validate password strength
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
        showRegisterError('register-password', passwordValidation.message);
        hasError = true;
    }
    
    // Validate passwords match
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
        showRegisterError('register-confirm', matchValidation.message);
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    showSpinner('Creating account...');
    
    try {
        // Call register function from auth.js
        await register(username, email, password);
        
        // Success - auth.js handles state update
        hideSpinner();
        showToast(`Welcome, ${appState.currentUser.username}!`, 'success');
        navigateTo('#/home');
        
    } catch (error) {
        hideSpinner();
        console.error('Registration error:', error);
        showRegisterError('register-confirm', error.message || 'Registration failed. Please try again.');
    }
}

// Show error message under input
function showRegisterError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + '-error');
    
    if (!input || !errorDiv) return;
    
    // Add error class to input
    input.classList.add('error');
    
    // Show error message
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Clear error for specific field
function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + '-error');
    
    if (input) {
        input.classList.remove('error');
    }
    
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
}

// Clear all errors
function clearAllErrors() {
    const errorDivs = document.querySelectorAll('.error-message');
    errorDivs.forEach(div => {
        div.textContent = '';
        div.classList.remove('show');
    });
    
    const inputs = document.querySelectorAll('input.error');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Validate individual field
function validateField(fieldType) {
    let isValid = true;
    
    if (fieldType === 'username') {
        const username = document.getElementById('register-username').value;
        const validation = validateUsername(username);
        if (!validation.isValid) {
            showRegisterError('register-username', validation.message);
            isValid = false;
        }
    } else if (fieldType === 'email') {
        const email = document.getElementById('register-email').value;
        const validation = validateEmail(email);
        if (!validation.isValid) {
            showRegisterError('register-email', validation.message);
            isValid = false;
        }
    } else if (fieldType === 'password') {
        const password = document.getElementById('register-password').value;
        const validation = validateStrongPassword(password);
        if (!validation.isValid) {
            showRegisterError('register-password', validation.message);
            isValid = false;
        }
    } else if (fieldType === 'confirm') {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const validation = validatePasswordMatch(password, confirmPassword);
        if (!validation.isValid) {
            showRegisterError('register-confirm', validation.message);
            isValid = false;
        }
    }
    
    return isValid;
}

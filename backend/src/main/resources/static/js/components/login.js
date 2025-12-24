// js/components/login.js
// Login Page Renderer

function renderLogin() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Welcome to Novelly</h1>
                    <p>Login to continue reading</p>
                </div>
                
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="login-email">Email or Username</label>
                        <input 
                            type="text" 
                            id="login-email" 
                            name="email" 
                            placeholder="Enter your email or username"
                            required 
                        />
                        <div class="error-message" id="login-email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input 
                            type="password" 
                            id="login-password" 
                            name="password" 
                            placeholder="Enter your password"
                            required 
                        />
                        <div class="error-message" id="login-password-error"></div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Login
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>Don't have an account? <a href="#/register">Register here</a></p>
                    <p><a href="#/" class="link-secondary">Register later - Browse as guest</a></p>
                </div>
            </div>
        </div>
    `;
}

// Initialize login form event handlers
function initrenderLogin() {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
        
        // Add real-time validation
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (emailInput) {
            emailInput.addEventListener('input', () => clearLoginFieldError('login-email'));
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => clearLoginFieldError('login-password'));
        }
    }
}

// Show error message under input
function showLoginError(inputId, message) {
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
function clearLoginFieldError(inputId) {
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

// Clear all login errors
function clearAllLoginErrors() {
    clearLoginFieldError('login-email');
    clearLoginFieldError('login-password');
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const emailOrUsername = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Clear all errors first
    clearAllLoginErrors();
    
    let hasError = false;
    
    // Basic validation
    if (!emailOrUsername || emailOrUsername.trim() === '') {
        showLoginError('login-email', 'Please enter your email or username');
        hasError = true;
    } else {
        // Check if it's an email format (if it contains @)
        if (emailOrUsername.includes('@')) {
            const emailValidation = validateEmail(emailOrUsername);
            if (!emailValidation.isValid) {
                showLoginError('login-email', emailValidation.message);
                hasError = true;
            }
        }
    }
    
    if (!password || password.trim() === '') {
        showLoginError('login-password', 'Please enter your password');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    showSpinner('Logging in...');
    
    try {
        // Call login function from auth.js
        await login(emailOrUsername, password);
        
        // Success - auth.js handles state update
        hideSpinner();
        showToast(`Welcome back, ${appState.currentUser.username}!`, 'success');
        navigateTo('#/home');
        
    } catch (error) {
        hideSpinner();
        console.error('Login error:', error);
        showLoginError('login-password', error.message || 'Login failed. Please try again.');
    }
}

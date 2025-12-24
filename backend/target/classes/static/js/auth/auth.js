function handleRegister(event) {
    event.preventDefault();
    
    // Clear all old errors
    clearError('registerUsername', 'registerUsernameError');
    clearError('registerEmail', 'registerEmailError');
    clearError('registerPassword', 'registerPasswordError');
    clearError('registerConfirmPassword', 'registerConfirmPasswordError');
    clearError('agreeTerms', 'agreeTermsError');
    
    // Get ALL form values
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    let isValid = true;
    
    // Validate each field
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        showError('registerUsername', 'registerUsernameError', usernameValidation.message);
        isValid = false;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        showError('registerEmail', 'registerEmailError', emailValidation.message);
        isValid = false;
    }
    
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
        showError('registerPassword', 'registerPasswordError', passwordValidation.message);
        isValid = false;
    }
    
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
        showError('registerConfirmPassword', 'registerConfirmPasswordError', matchValidation.message);
        isValid = false;
    }
    
    if (!agreeTerms) {
        showError('agreeTerms', 'agreeTermsError', 'You must agree to terms');
        isValid = false;
    }
    
    // CRITICAL: Stop if any error
    if (!isValid) return;
    
    // All valid - prepare data
    const registerData = { username, email, password };
    console.log('Register:', registerData);
    // TODO: Send to backend
    
    // Show success
    showAlert('register-alert', 'Account created!', 'success', 5000);
    
    // ONLY reset after success
    resetForm('registerForm');
}

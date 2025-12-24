function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field) {
        field.classList.add('error');
        field.classList.remove('success');
    }
    
    if (error) {
        error.textContent = message;
        error.classList.add('show');
    }
}

function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field) {
        field.classList.remove('error');
    }
    
    if (error) {
        error.classList.remove('show');
        error.textContent = '';
    }
}

function markSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('success');
        field.classList.remove('error');
    }
}

function showAlert(alertId, message, type = 'info', autoClose = 5000) {
    const alert = document.getElementById(alertId);
    
    if (alert) {
        alert.className = `alert show alert-${type}`;
        alert.textContent = message;
        
        if (autoClose > 0) {
            setTimeout(() => {
                alert.classList.remove('show');
            }, autoClose);
        }
    }
}

function hideAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.classList.remove('show');
    }
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.reset();
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    const errors = form.querySelectorAll('.error-message, .success-message');
    errors.forEach(error => {
        error.classList.remove('show');
    });
    
    const strengthIndicator = form.querySelector('.password-strength');
    if (strengthIndicator) {
        strengthIndicator.classList.remove('show');
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Storage error:', error);
    }
}

function getStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Storage error:', error);
    }
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function validateEmail(email) {
    email = email.trim();
    
    if (!email) {
        return { isValid: false, message: 'Email is required' };
    }
    
    if (!isValidEmail(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true, message: 'Email is valid' };
}

function validateUsername(username) {
    username = username.trim();
    
    if (!username) {
        return { isValid: false, message: 'Username is required' };
    }
    
    if (username.length < 3) {
        return { isValid: false, message: 'Username must be at least 3 characters' };
    }
    
    if (username.length > 20) {
        return { isValid: false, message: 'Username must not exceed 20 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { isValid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    
    return { isValid: true, message: 'Username is valid' };
}

function validatePassword(password, minLength = 6) {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters` };
    }
    
    return { isValid: true, message: 'Password is valid' };
}

function validateStrongPassword(password) {
    if (!password) {
        return { isValid: false, message: 'Password is required', strength: 'none' };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters', strength: 'weak' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter', strength: 'weak' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter', strength: 'medium' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number', strength: 'medium' };
    }
    
    return { isValid: true, message: 'Password is strong', strength: 'strong' };
}

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (!password) {
        return { score: 0, strength: 'none', message: '' };
    }
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    if (strength <= 2) {
        return { score: strength, strength: 'weak', message: 'Weak - Add uppercase, numbers, or symbols' };
    } else if (strength <= 4) {
        return { score: strength, strength: 'medium', message: 'Medium - Add more variety for better security' };
    } else {
        return { score: strength, strength: 'strong', message: 'Strong - Great password!' };
    }
}

function validatePasswordMatch(password, confirmPassword) {
    if (!confirmPassword) {
        return { isValid: false, message: 'Please confirm your password' };
    }
    
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }
    
    return { isValid: true, message: 'Passwords match' };
}
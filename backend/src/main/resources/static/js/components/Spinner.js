// Show loading spinner
function showSpinner(message = 'Loading...') {
    const spinner = document.getElementById('spinner-overlay');
    const spinnerText = document.getElementById('spinner-text');
    
    if (spinner) {
        if (spinnerText) {
            spinnerText.textContent = message;
        }
        spinner.classList.remove('hidden');
        spinner.style.display = 'flex';
    }
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    
    if (spinner) {
        spinner.classList.add('hidden');
        spinner.style.display = 'none';
    }
}

// Create spinner HTML element
function Spinner({ message = 'Loading...' } = {}) {
    return `
        <div class="spinner-container">
            <div class="spinner-ring"></div>
            <p class="spinner-text">${message}</p>
        </div>
    `;
}

// Make available globally
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.Spinner = Spinner;

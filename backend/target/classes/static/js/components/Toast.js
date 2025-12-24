function Toast({ message, type = 'info', duration = 3000 }) {
    return `
        <div class="toast toast-${type}">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = Toast({ message, type });
    const toastElement = wrapper.firstElementChild;
    
    if (!toastElement) {
        console.error('Failed to create toast element');
        return;
    }
    
    document.body.appendChild(toastElement);
    
    // Slide in
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    // Auto-hide
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 300);
    }, duration);
}
// Make showToast globally available
window.showToast = showToast;
window.Toast = Toast;
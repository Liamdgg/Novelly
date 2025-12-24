function Button({ text, onClick, type = 'primary', disabled = false, fullWidth = false }) {
    const classes = [
        'btn',
        `btn-${type}`,
        fullWidth ? 'btn-full' : '',
        disabled ? 'disabled' : ''
    ].filter(Boolean).join(' ');
    
    const onclickAttr = onClick ? `onclick="${onClick}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    
    return `
        <button class="${classes}" ${onclickAttr} ${disabledAttr}>
            ${text}
        </button>
    `;
}

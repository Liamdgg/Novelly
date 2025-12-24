function Modal({ title, content, onClose }) {
    return `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

function openModal(title, content) {
    document.body.insertAdjacentHTML('beforeend', Modal({ title, content }));
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    document.body.style.overflow = ''; // Restore scroll
}

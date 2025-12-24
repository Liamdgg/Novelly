// js/components/admin.js
// Admin Panel for Managing novels and Chapters

// Cache for novels list to avoid redundant API calls
let adminNovelsCache = null;
let adminNovelsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function renderAdmin() {
    return `
        ${renderHeader()}
        <main class="admin-page">
            <div class="admin-container">
                <h1>Admin Panel</h1>
                <p class="admin-subtitle">Manage novels and chapters</p>
                
                <div class="admin-tabs">
                    <button class="admin-tab-btn active" onclick="switchAdminTab('add-novel')">
                        Add novel
                    </button>
                    <button class="admin-tab-btn" onclick="switchAdminTab('add-chapter')">
                        Add Chapter
                    </button>
                    <button class="admin-tab-btn" onclick="switchAdminTab('manage-novels')">
                        Manage novels
                    </button>
                </div>
                
                <div class="admin-content">
                    <!-- Add novel Form -->
                    <div id="add-novel-tab" class="admin-tab-content active">
                        <div class="admin-form-card">
                            <h2>Add New novel</h2>
                            <form id="add-novel-form" class="admin-form">
                                <div class="form-group">
                                    <label for="novel-title">novel Title *</label>
                                    <input 
                                        type="text" 
                                        id="novel-title" 
                                        name="title" 
                                        placeholder="Enter novel title"
                                        required
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="novel-author">Author *</label>
                                    <input 
                                        type="text" 
                                        id="novel-author" 
                                        name="author" 
                                        placeholder="Enter author name"
                                        required
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="novel-description">Description *</label>
                                    <textarea 
                                        id="novel-description" 
                                        name="description" 
                                        placeholder="Enter novel description"
                                        rows="4"
                                        required
                                    ></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="novel-cover">Cover Image *</label>
                                    <div class="file-upload-area" id="cover-upload-area">
                                        <input 
                                            type="file" 
                                            id="novel-cover" 
                                            name="coverImage" 
                                            accept="image/*"
                                            required
                                        />
                                        <div class="file-upload-label">
                                            <span class="upload-icon">📁</span>
                                            <span class="upload-text">Choose cover image or drag here</span>
                                            <span class="upload-hint">Supports: JPG, PNG (Max 5MB)</span>
                                        </div>
                                        <div id="cover-preview" class="image-preview"></div>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="resetNovelForm()">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        ✅ Submit novel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Add Chapter Form -->
                    <div id="add-chapter-tab" class="admin-tab-content">
                        <div class="admin-form-card">
                            <h2>Add New Chapter</h2>
                            <form id="add-chapter-form" class="admin-form">
                                <div class="form-group">
                                    <label for="chapter-novel">Select novel *</label>
                                    <select id="chapter-novel" name="novelId" required>
                                        <option value="">Loading novels...</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="chapter-number">Chapter Number *</label>
                                    <input 
                                        type="number" 
                                        id="chapter-number" 
                                        name="chapterNumber" 
                                        placeholder="e.g., 1"
                                        min="1"
                                        required
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="chapter-title">Chapter Title</label>
                                    <input 
                                        type="text" 
                                        id="chapter-title" 
                                        name="chapterTitle" 
                                        placeholder="Enter chapter title (optional)"
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="chapter-content">Chapter Content *</label>
                                    <textarea 
                                        id="chapter-content" 
                                        name="content" 
                                        placeholder="Paste or type the chapter text content here..."
                                        rows="15"
                                        required
                                        style="font-family: 'Georgia', serif; line-height: 1.8; font-size: 16px;"
                                    ></textarea>
                                    <div class="content-hint">
                                        <span class="content-icon">📝</span>
                                        <span>Tip: You can paste text from Word, Notepad, or any text editor</span>
                                    </div>
                                    <div id="content-char-count" class="char-count">0 characters</div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="resetChapterForm()">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        ✅ Submit Chapter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Manage novels Tab -->
                    <div id="manage-novels-tab" class="admin-tab-content">
                        <div class="admin-form-card">
                            <h2>Manage novels</h2>
                            <div id="novels-list-container" class="novels-list">
                                <div class="loading-message">Loading novels...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- Edit novel Modal -->
        <div id="edit-novel-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit novel</h2>
                    <button class="modal-close" onclick="closeEditModal()">✕</button>
                </div>
                <form id="edit-novel-form" class="admin-form">
                    <input type="hidden" id="edit-novel-id" />
                    
                    <div class="form-group">
                        <label for="edit-novel-title">novel Title *</label>
                        <input type="text" id="edit-novel-title" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-novel-author">Author *</label>
                        <input type="text" id="edit-novel-author" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-novel-description">Description *</label>
                        <textarea id="edit-novel-description" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-novel-cover">Replace Cover Image (optional)</label>
                        <input type="file" id="edit-novel-cover" accept="image/*" />
                        <div id="edit-cover-preview" class="image-preview"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Initialize admin page
async function initrenderAdmin() {
    initHeader();
    setupAdminForms();
    
    // Load novels into dropdown
    const NovelSelect = document.getElementById('chapter-novel');
    if (NovelSelect) {
        const options = await generateNovelOptions();
        NovelSelect.innerHTML = '<option value="">-- Choose a novel --</option>' + options;
    }
    
    // Load manage novels list
    loadNovelsList();
}

// Switch between admin tabs
function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Fetch novels with caching to avoid redundant API calls
async function getCachedNovels() {
    const now = Date.now();
    
    // Return cached novels if still valid
    if (adminNovelsCache && (now - adminNovelsCacheTime) < CACHE_DURATION) {
        return adminNovelsCache;
    }
    
    // Fetch fresh data from API
    try {
        const response = await api.novels.getAll(0, 100, '');
        // Backend returns array directly, not paginated response
        adminNovelsCache = Array.isArray(response) ? response : (response.content || []);
        adminNovelsCacheTime = now;
        return adminNovelsCache;
    } catch (error) {
        console.error('Error fetching novels:', error);
        return [];
    }
}

// Generate novel options for chapter form
async function generateNovelOptions() {
    try {
        const novels = await getCachedNovels();
        
        if (novels.length === 0) {
            return '<option value="">No novels available</option>';
        }
        
        // Support both mockData (id) and backend DTO (novelId)
        return novels.map(novel => {
            const id = novel.novelId || novel.id;
            return `<option value="${id}">${novel.title}</option>`;
        }).join('');
    } catch (error) {
        console.error('Error loading novels:', error);
        return '<option value="">Failed to load novels</option>';
    }
}

// Setup admin forms
function setupAdminForms() {
    setupNovelForm();
    setupChapterForm();
}

// Setup add novel form
function setupNovelForm() {
    const form = document.getElementById('add-novel-form');
    const coverInput = document.getElementById('novel-cover');
    const coverPreview = document.getElementById('cover-preview');
    
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                previewImage(file, coverPreview);
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleNovelSubmit);
    }
}

// Setup add chapter form
function setupChapterForm() {
    const form = document.getElementById('add-chapter-form');
    const contentTextarea = document.getElementById('chapter-content');
    const charCount = document.getElementById('content-char-count');
    
    if (contentTextarea && charCount) {
        contentTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = `${count.toLocaleString()} characters`;
            
            // Visual feedback for content length
            if (count < 100) {
                charCount.style.color = '#e74c3c';
            } else if (count < 500) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#27ae60';
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleChapterSubmit);
    }
}

// Preview single image (for cover upload)
function previewImage(file, container) {
    const reader = new FileReader();
    reader.onload = (e) => {
        container.innerHTML = `
            <img src="${e.target.result}" alt="Preview" />
            <button type="button" class="remove-preview" onclick="clearImagePreview('cover-preview')">
                ✕
            </button>
        `;
    };
    reader.readAsDataURL(file);
}

// Clear image preview
function clearImagePreview(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
    const input = document.getElementById('novel-cover');
    if (input) {
        input.value = '';
    }
}

// Handle novel form submission
async function handleNovelSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const coverFile = formData.get('coverImage');
    
    // Validate
    if (!coverFile || !coverFile.name) {
        showToast('Please select a cover image', 'error');
        return;
    }
    
    showSpinner('Uploading novel...');
    
    try {
        // Upload novel with cover image using multipart endpoint
        const newNovel = await api.novels.upload(formData);
        
        hideSpinner();
        showToast('novel added successfully! 🎉', 'success');
        resetNovelForm();
        
        // Invalidate cache since we added a new novel
        adminNovelsCache = null;
        
        console.log('New novel added:', newNovel);
        
        // Refresh home page if viewing
        const NovelsGrid = document.getElementById('novels-grid');
        if (NovelsGrid && typeof loadAllNovels === 'function') {
            loadAllNovels(1);
        }
        
    } catch (error) {
        hideSpinner();
        console.error('Error adding novel:', error);
        showToast(error.message || 'Failed to add novel', 'error');
    }
}

// Handle chapter form submission
async function handleChapterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const novelId = parseInt(formData.get('novelId'));
    const chapterNumber = parseInt(formData.get('chapterNumber'));
    const chapterTitle = formData.get('chapterTitle');
    const content = formData.get('content');
    
    console.log('Chapter submit - novelId:', novelId, 'chapterNumber:', chapterNumber, 'content length:', content?.length);
    
    // Validate
    if (!novelId || isNaN(novelId)) {
        showToast('Please select a novel', 'error');
        return;
    }
    
    if (!chapterNumber || isNaN(chapterNumber)) {
        showToast('Please enter a valid chapter number', 'error');
        return;
    }
    
    if (!content || content.trim().length === 0) {
        showToast('Please enter chapter content', 'error');
        return;
    }
    
    if (content.trim().length < 100) {
        showToast('Chapter content is too short (minimum 100 characters)', 'error');
        return;
    }
    
    showSpinner(`Uploading chapter...`);
    
    try {
        // Create chapter with text content
        const chapterData = {
            novelId: novelId,
            chapterNumber: chapterNumber,
            title: chapterTitle || `Chapter ${chapterNumber}`,
            content: content.trim()
        };
        
        const newChapter = await api.chapters.create(novelId, chapterData);
        
        hideSpinner();
        showToast(`Chapter ${chapterNumber} added successfully! 📚`, 'success');
        resetChapterForm();
        
        console.log('New chapter added:', newChapter);
        
        // If user is in reader for this novel, update chapter dropdown
        if (window.readerState && window.readerState.novelId === novelId) {
            if (typeof addChapterToDropdown === 'function') {
                addChapterToDropdown(newChapter);
            }
        }
        
    } catch (error) {
        hideSpinner();
        console.error('Error adding chapter:', error);
        showToast(error.message || 'Failed to add chapter', 'error');
    }
}

// Reset novel form
function resetNovelForm() {
    const form = document.getElementById('add-novel-form');
    if (form) {
        form.reset();
        document.getElementById('cover-preview').innerHTML = '';
    }
}

// Reset chapter form
function resetChapterForm() {
    const form = document.getElementById('add-chapter-form');
    if (form) {
        form.reset();
        const charCount = document.getElementById('content-char-count');
        if (charCount) {
            charCount.textContent = '0 characters';
            charCount.style.color = '#888';
        }
    }
}

// Load novels list for management
async function loadNovelsList() {
    const container = document.getElementById('novels-list-container');
    if (!container) return;
    
    try {
        container.innerHTML = Spinner({ message: 'Loading novels...' });
        
        const novels = await getCachedNovels();
        
        if (novels.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No novels found. Add one using the Add novel tab!</p></div>';
            return;
        }
        
        // Create rows asynchronously to fetch chapter counts
        const rows = await Promise.all(novels.map(novel => createNovelRow(novel)));
        
        container.innerHTML = `
            <div class="novels-table">
                ${rows.join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading novels:', error);
        container.innerHTML = '<div class="error-message">Failed to load novels</div>';
    }
}

// Create novel row for management table
async function createNovelRow(novel) {
    const novelId = novel.novelId || novel.id;
    const cover = novel.coverImageUrl || 'assets/placeholder.png';
    
    // Fetch chapter count for this novel
    let chapterCount = 0;
    try {
        const chapters = await api.chapters.getBynovelId(novelId);
        chapterCount = Array.isArray(chapters) ? chapters.length : (chapters.content ? chapters.content.length : 0);
    } catch (error) {
        console.log('Could not fetch chapters for novel', novelId, error);
    }
    
    return `
        <div class="novel-row" data-novel-id="${novelId}">
            <div class="novel-row-cover">
                <img src="${cover}" alt="${novel.title}" />
            </div>
            <div class="novel-row-info">
                <h3>${novel.title}</h3>
                <p class="novel-row-author">By ${novel.author}</p>
                <p class="novel-row-desc">${(novel.description || '').substring(0, 100)}${(novel.description || '').length > 100 ? '...' : ''}</p>
                <span class="novel-row-meta">${chapterCount} chapters</span>
            </div>
            <div class="novel-row-actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal(${novelId})">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="handleDeleteNovel(${novelId}, '${novel.title.replace(/'/g, "\\'")}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

// Open edit modal with novel data
async function openEditModal(novelId) {
    try {
        showSpinner('Loading novel...');
        const novel = await api.novels.getById(novelId);
        hideSpinner();
        
        // Populate form
        document.getElementById('edit-novel-id').value = novel.novelId;
        document.getElementById('edit-novel-title').value = novel.title;
        document.getElementById('edit-novel-author').value = novel.author;
        document.getElementById('edit-novel-description').value = novel.description || '';
        
        // Show current cover
        const preview = document.getElementById('edit-cover-preview');
        if (novel.coverImageUrl) {
            preview.innerHTML = `<img src="${novel.coverImageUrl}" alt="Current cover" />`;
        }
        
        // Setup cover change preview
        const coverInput = document.getElementById('edit-novel-cover');
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                previewImage(file, preview);
            }
        });
        
        // Setup form submit
        const form = document.getElementById('edit-novel-form');
        form.onsubmit = (e) => handleEditSubmit(e, novelId);
        
        // Show modal
        document.getElementById('edit-novel-modal').classList.add('show');
    } catch (error) {
        hideSpinner();
        console.error('Error loading novel:', error);
        showToast('Failed to load novel details', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-novel-modal').classList.remove('show');
    document.getElementById('edit-novel-form').reset();
    document.getElementById('edit-cover-preview').innerHTML = '';
}

// Handle edit form submission
async function handleEditSubmit(e, novelId) {
    e.preventDefault();
    
    const title = document.getElementById('edit-novel-title').value;
    const author = document.getElementById('edit-novel-author').value;
    const description = document.getElementById('edit-novel-description').value;
    const coverFile = document.getElementById('edit-novel-cover').files[0];
    
    showSpinner('Updating novel...');
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        if (coverFile) {
            formData.append('coverImage', coverFile);
        }
        
        await api.novels.update(novelId, formData);
        
        hideSpinner();
        showToast('novel updated successfully! ✅', 'success');
        closeEditModal();
        loadNovelsList(); // Refresh list
    } catch (error) {
        hideSpinner();
        console.error('Error updating novel:', error);
        showToast(error.message || 'Failed to update novel', 'error');
    }
}

// Handle delete novel
async function handleDeleteNovel(novelId, title) {
    // Debug: Check user role
    console.log('Current user:', appState.currentUser);
    console.log('User role:', appState.currentUser?.role);
    console.log('JWT token exists:', !!appState.jwtToken);
    
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis will also delete all chapters and pages for this novel. This action cannot be undone.`)) {
        return;
    }
    
    showSpinner('Deleting novel...');
    
    try {
        await api.novels.delete(novelId);
        
        hideSpinner();
        showToast('novel deleted successfully', 'success');
        loadNovelsList(); // Refresh list
    } catch (error) {
        hideSpinner();
        console.error('Error deleting novel:', error);
        showToast(error.message || 'Failed to delete novel. Make sure you have ADMIN role.', 'error');
    }
}

// Make functions globally available
window.switchAdminTab = switchAdminTab;
window.clearImagePreview = clearImagePreview;
window.resetNovelForm = resetNovelForm;
window.resetChapterForm = resetChapterForm;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.handleDeleteNovel = handleDeleteNovel;

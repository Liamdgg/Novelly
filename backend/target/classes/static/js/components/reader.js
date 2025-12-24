// js/components/reader.js
// Full-screen Chapter Reader with Navigation

// Store reader state
window.readerState = {
    novelId: null,
    chapterId: null,
    novel: null,
    chapters: [],
    currentProgress: null
};

function renderReader(params) {
    const { novelId, chapterId } = params;
    
    // Store in global state
    window.readerState.novelId = parseInt(novelId);
    window.readerState.chapterId = parseInt(chapterId);
    
    return `
        ${renderHeader()}
        
        <main class="reader-page">
            <!-- Reader Controls (Top 20%) -->
            <div class="reader-controls">
                <div class="reader-controls-left">
                    <button class="btn btn-secondary" onclick="navigateTo('#/novel/${novelId}')">
                        ← Back to Novel Info
                    </button>
                    
                    <div class="chapter-info">
                        <h2 id="novel-title">Loading...</h2>
                        <span id="chapter-title">Chapter ${chapterId}</span>
                    </div>
                </div>
                
                <div class="reader-controls-right">
                    <select id="chapter-selector" class="chapter-dropdown" onchange="handleChapterChange()">
                        <option value="">Loading chapters...</option>
                    </select>
                    
                    <button id="save-progress-btn" class="btn btn-primary" onclick="saveReadingProgress()">
                        <span id="progress-icon">💾</span> Save Progress
                    </button>
                </div>
            </div>
            
            <!-- Chapter Content (A4 Paper Size) -->
            <div id="reader-container" class="reader-container">
                <p style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                    Loading chapter...
                </p>
            </div>
        </main>
    `;
}

function initReader(params) {
    initHeader();
    loadChapter(params.novelId, params.chapterId);
    loadReadingProgress(params.novelId);
    loadChaptersList(params.novelId);
}

// Load chapter data and render images
 

async function loadChapter(novelId, chapterId) {
    console.log('[Reader] loadChapter called with:', { novelId, chapterId });
    showSpinner('Loading chapter...');
    
    try {
        // Fetch novel from API
        console.log('[Reader] Fetching novel:', novelId);
        const novel = await api.novels.getById(novelId);
        console.log('[Reader] Novel fetched:', novel);
        
        if (!novel) {
            throw new Error('novel not found');
        }
        
        window.readerState.novel = novel;
        
        // Update novel title
        const NovelTitleEl = document.getElementById('novel-title');
        if (NovelTitleEl) {
            NovelTitleEl.textContent = novel.title;
        }
        
        // Fetch chapter data with text content
        console.log('[Reader] Fetching chapter:', chapterId);
        console.log('[Reader] Using API method:', api.chapters.getById);
        const chapter = await api.chapters.getById(chapterId);
        console.log('[Reader] Chapter fetched:', chapter);
        
        if (!chapter) {
            throw new Error('Chapter not found');
        }
        
        if (!chapter.content || chapter.content.trim() === '') {
            throw new Error('Chapter content is empty');
        }
        
        // Update chapter title if available
        const chapterTitleEl = document.getElementById('chapter-title');
        if (chapterTitleEl) {
            chapterTitleEl.textContent = chapter.title || `Chapter ${chapter.chapterNumber}`;
        }
        
        // Use chapterRenderer to display text
        if (typeof renderChapterText === 'function') {
            renderChapterText(chapter.content, {
                novelId,
                chapterId
            });
        } else {
            console.error('chapterRenderer.js not loaded');
            hideSpinner();
        }
        
    } catch (error) {
        console.error('Error loading chapter:', error);
        hideSpinner();
        showToast('Failed to load chapter', 'error');
        
        const container = document.getElementById('reader-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: var(--color-error);">Failed to load chapter</p>
                    <button class="btn btn-primary" onclick="navigateTo('#/home')">
                        Return to Home
                    </button>
                </div>
            `;
        }
    }
}

// Load chapters list for dropdown
async function loadChaptersList(novelId) {
    try {
        // Fetch chapters from API
        const chapters = await api.chapters.getBynovelId(novelId);
        
        if (!chapters || chapters.length === 0) {
            console.warn('No chapters found for novel', novelId);
            return;
        }
        
        window.readerState.chapters = chapters;
        
        // Populate top dropdown
        const selector = document.getElementById('chapter-selector');
        if (selector) {
            selector.innerHTML = chapters.map(ch => {
                const chId = ch.chapterId || ch.id;
                return `
                    <option value="${chId}" ${chId === parseInt(window.readerState.chapterId) ? 'selected' : ''}>
                        Chapter ${ch.chapterNumber}${ch.title ? ': ' + ch.title : ''}
                    </option>
                `;
            }).join('');
        }
        
        // Populate bottom dropdown
        const bottomSelector = document.getElementById('bottom-chapter-selector');
        if (bottomSelector) {
            bottomSelector.innerHTML = chapters.map(ch => {
                const chId = ch.chapterId || ch.id;
                return `
                    <option value="${chId}" ${chId === parseInt(window.readerState.chapterId) ? 'selected' : ''}>
                        Chapter ${ch.chapterNumber}${ch.title ? ': ' + ch.title : ''}
                    </option>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error('Error loading chapters list:', error);
    }
}

// Handle chapter change from top dropdown
function handleChapterChange() {
    const selector = document.getElementById('chapter-selector');
    if (!selector) return;
    
    const newChapterId = selector.value;
    if (newChapterId && window.readerState.novelId) {
        navigateTo(`#/reader/${window.readerState.novelId}/${newChapterId}`);
    }
}

// Handle chapter change from bottom dropdown
function handleBottomChapterChange() {
    const selector = document.getElementById('bottom-chapter-selector');
    if (!selector) return;
    
    const newChapterId = selector.value;
    if (newChapterId && window.readerState.novelId) {
        navigateTo(`#/reader/${window.readerState.novelId}/${newChapterId}`);
    }
}

// Navigate to previous chapter
function goToPreviousChapter() {
    const chapters = window.readerState.chapters;
    if (!chapters || chapters.length === 0) return;
    
    const currentChapterId = parseInt(window.readerState.chapterId);
    const currentIndex = chapters.findIndex(ch => (ch.chapterId || ch.id) === currentChapterId);
    
    if (currentIndex > 0) {
        const prevChapter = chapters[currentIndex - 1];
        const prevChapterId = prevChapter.chapterId || prevChapter.id;
        navigateTo(`#/reader/${window.readerState.novelId}/${prevChapterId}`);
    } else {
        showToast('This is the first chapter', 'info');
    }
}

// Navigate to next chapter
function goToNextChapter() {
    const chapters = window.readerState.chapters;
    if (!chapters || chapters.length === 0) return;
    
    const currentChapterId = parseInt(window.readerState.chapterId);
    const currentIndex = chapters.findIndex(ch => (ch.chapterId || ch.id) === currentChapterId);
    
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        const nextChapterId = nextChapter.chapterId || nextChapter.id;
        navigateTo(`#/reader/${window.readerState.novelId}/${nextChapterId}`);
    } else {
        showToast('This is the last chapter', 'info');
    }
}

// Load reading progress for current novel
async function loadReadingProgress(novelId) {
    if (!appState.currentUser) {
        return;
    }
    
    try {
        const progress = await api.readingProgress.getByNovel(appState.currentUser.userId, novelId);
        window.readerState.currentProgress = progress;
        
        // Update button to show current progress
        updateProgressButton(progress);
    } catch (error) {
        console.error('Error loading reading progress:', error);
        window.readerState.currentProgress = null;
    }
}

// Save reading progress
window.saveReadingProgress = async function() {
    const { novelId, chapterId, novel } = window.readerState;
    
    if (!novelId || !chapterId || !appState.currentUser) {
        showToast('Please log in to save progress', 'info');
        return;
    }
    
    const btn = document.getElementById('save-progress-btn');
    const icon = document.getElementById('progress-icon');
    
    try {
        btn.disabled = true;
        icon.textContent = '⏳';
        
        // Get chapter info for display
        const chapterSelector = document.getElementById('chapter-selector');
        const chapterTitle = chapterSelector?.selectedOptions[0]?.textContent || `Chapter ${chapterId}`;
        
        const progressData = {
            novelId: novelId,
            chapterId: chapterId,
            novelTitle: novel?.title || 'Unknown',
            chapterTitle: chapterTitle
        };
        
        await api.readingProgress.save(appState.currentUser.userId, progressData);
        
        window.readerState.currentProgress = progressData;
        
        icon.textContent = '✅';
        setTimeout(() => {
            icon.textContent = '💾';
            btn.disabled = false;
        }, 1500);
        
        showToast(`Progress saved: ${chapterTitle}`, 'success');
    } catch (error) {
        console.error('Error saving progress:', error);
        icon.textContent = '❌';
        setTimeout(() => {
            icon.textContent = '💾';
            btn.disabled = false;
        }, 2000);
        showToast('Failed to save progress', 'error');
    }
};

// Update progress button to show last saved progress
function updateProgressButton(progress) {
    const btn = document.getElementById('save-progress-btn');
    
    if (btn && progress && progress.chapterTitle) {
        btn.title = `Last saved: ${progress.chapterTitle}`;
    }
}

// Add new chapter to dropdown (called from admin after upload)
function addChapterToDropdown(chapterData) {
    const selector = document.getElementById('chapter-selector');
    if (!selector) return;
    
    const option = document.createElement('option');
    option.value = chapterData.chapterId;
    option.textContent = `Chapter ${chapterData.chapterNumber}${chapterData.title ? ': ' + chapterData.title : ''}`;
    
    selector.appendChild(option);
    
    // Add to state
    window.readerState.chapters.push(chapterData);
    
    showToast('New chapter available!', 'success');
}

// Setup comment form character counter
function setupCommentForm() {
    const textarea = document.getElementById('comment-textarea');
    const charCount = document.getElementById('char-count');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    }
}

// Load comments for novel (chapter-level commenting not implemented yet)
async function loadComments(novelId, chapterId) {
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');
    
    if (!commentsList) return;
    
    try {
        // Fetch comments for the novel
        const comments = await api.comments.getByNovel(novelId);
        
        // Transform backend DTO to frontend format
        const formattedComments = comments.map(c => ({
            id: c.commentId,
            username: c.username,
            avatar: null,
            text: c.content,
            timestamp: c.createdAt
        }));
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
        } else {
            commentsList.innerHTML = comments.map(comment => renderComment(comment)).join('');
        }
        
        if (commentsCount) {
            commentsCount.textContent = comments.length;
        }
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="error-message">
                <p>Failed to load comments. Please try again.</p>
            </div>
        `;
    }
}

// Render single comment
function renderComment(comment) {
    const timeAgo = getTimeAgo(new Date(comment.timestamp));
    const initials = comment.username.substring(0, 2).toUpperCase();
    
    return `
        <div class="comment-item">
            <div class="comment-avatar">
                ${comment.avatar ? 
                    `<img src="${comment.avatar}" alt="${comment.username}" />` :
                    `<div class="avatar-initials">${initials}</div>`
                }
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        </div>
    `;
}

// Post new comment
async function postComment() {
    const textarea = document.getElementById('comment-textarea');
    const text = textarea?.value.trim();
    
    if (!text) {
        showToast('Please enter a comment', 'warning');
        return;
    }
    
    const { novelId, chapterId } = window.readerState;
    
    if (!novelId || !chapterId) {
        showToast('Unable to post comment', 'error');
        return;
    }
    
    if (!appState.currentUser) {
        showToast('Please log in to comment', 'warning');
        return;
    }
    
    showSpinner('Posting comment...');
    
    try {
        // Post comment to backend
        const savedComment = await api.comments.create(novelId, text);
        
        // Transform response to display format
        const newComment = {
            id: savedComment.commentId,
            username: savedComment.username,
            avatar: null,
            text: savedComment.content,
            timestamp: savedComment.createdAt
        };
        
        // Add comment to display
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            const noComments = commentsList.querySelector('.no-comments');
            if (noComments) {
                noComments.remove();
            }
            
            commentsList.insertAdjacentHTML('afterbegin', renderComment(newComment));
            
            const countSpan = document.getElementById('comments-count');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = currentCount + 1;
            }
        }
        
        textarea.value = '';
        document.getElementById('char-count').textContent = '0';
        
        hideSpinner();
        showToast('Comment posted successfully!', 'success');
        
    } catch (error) {
        hideSpinner();
        console.error('Error posting comment:', error);
        showToast('Failed to post comment. Please try again.', 'error');
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

// Make functions globally available
window.handleChapterChange = handleChapterChange;
window.handleBottomChapterChange = handleBottomChapterChange;
window.goToPreviousChapter = goToPreviousChapter;
window.goToNextChapter = goToNextChapter;
window.addChapterToDropdown = addChapterToDropdown;
window.postComment = postComment;
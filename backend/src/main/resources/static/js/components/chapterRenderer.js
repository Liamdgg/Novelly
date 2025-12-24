// js/components/chapterRenderer.js
// Chapter Text Renderer for Novel Reading

// Reading preferences (stored in localStorage)
const DEFAULT_READING_PREFS = {
    fontSize: '18px',
    fontFamily: 'Georgia, serif',
    theme: 'light' // light, dark, sepia
};

// Load reading preferences from localStorage
function loadReadingPreferences() {
    const saved = localStorage.getItem('readingPreferences');
    return saved ? JSON.parse(saved) : { ...DEFAULT_READING_PREFS };
}

// Save reading preferences to localStorage
function saveReadingPreferences(prefs) {
    localStorage.setItem('readingPreferences', JSON.stringify(prefs));
}

// Render chapter text content in the reader
function renderChapterText(chapterContent, options = {}) {
    if (!chapterContent) {
        showError('No content found for this chapter');
        return;
    }
    
    const container = document.getElementById('reader-container');
    if (!container) {
        console.error('Reader container not found');
        return;
    }
    
    const prefs = loadReadingPreferences();
    
    // Reading customization controls
    const controlsHTML = `
        <div class="reading-controls">
            <div class="reading-control-group">
                <label>Font Size:</label>
                <button onclick="adjustFontSize(-2)" class="btn-icon">A-</button>
                <span id="font-size-display">${parseInt(prefs.fontSize)}px</span>
                <button onclick="adjustFontSize(2)" class="btn-icon">A+</button>
            </div>
            
            <div class="reading-control-group">
                <label>Font:</label>
                <select id="font-family-selector" onchange="changeFontFamily(this.value)">
                    <option value="Georgia, serif" ${prefs.fontFamily === 'Georgia, serif' ? 'selected' : ''}>Serif</option>
                    <option value="Arial, sans-serif" ${prefs.fontFamily === 'Arial, sans-serif' ? 'selected' : ''}>Sans-Serif</option>
                    <option value="'Courier New', monospace" ${prefs.fontFamily === "'Courier New', monospace" ? 'selected' : ''}>Monospace</option>
                </select>
            </div>
            
            <div class="reading-control-group">
                <label>Theme:</label>
                <button onclick="changeTheme('light')" class="btn-theme ${prefs.theme === 'light' ? 'active' : ''}">☀️</button>
                <button onclick="changeTheme('sepia')" class="btn-theme ${prefs.theme === 'sepia' ? 'active' : ''}">📜</button>
                <button onclick="changeTheme('dark')" class="btn-theme ${prefs.theme === 'dark' ? 'active' : ''}">🌙</button>
            </div>
        </div>
    `;
    
    // Chapter text content
    const contentHTML = `
        <div class="chapter-text-content" id="chapter-text">
            ${chapterContent.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '<br>').join('')}
        </div>
    `;
    
    // Chapter navigation at the end
    const navigationHTML = `
        <div class="chapter-navigation">
            <button id="prev-chapter-btn" class="btn btn-secondary" onclick="goToPreviousChapter()">
                ⬅️ Previous Chapter
            </button>
            <select id="bottom-chapter-selector" class="chapter-dropdown" onchange="handleBottomChapterChange()">
                <option value="">Select Chapter</option>
            </select>
            <button id="next-chapter-btn" class="btn btn-secondary" onclick="goToNextChapter()">
                Next Chapter ➡️
            </button>
        </div>
    `;
    
    container.innerHTML = controlsHTML + contentHTML + navigationHTML;
    
    // Apply reading preferences
    applyReadingPreferences(prefs);
    
    // Setup scroll tracking for reading progress
    setupScrollTracking(options.novelId, options.chapterId);
    
    // Auto-save reading progress
    if (options.novelId && options.chapterId) {
        saveReadingProgress(options.novelId, options.chapterId, 0);
    }
    
    hideSpinner();
}

// Apply reading preferences to the text
function applyReadingPreferences(prefs) {
    const textContent = document.getElementById('chapter-text');
    const container = document.getElementById('reader-container');
    
    if (textContent) {
        textContent.style.fontSize = prefs.fontSize;
        textContent.style.fontFamily = prefs.fontFamily;
    }
    
    if (container) {
        container.className = `reader-container theme-${prefs.theme}`;
    }
}

// Adjust font size
function adjustFontSize(delta) {
    const prefs = loadReadingPreferences();
    let currentSize = parseInt(prefs.fontSize);
    currentSize = Math.max(12, Math.min(32, currentSize + delta)); // Min 12px, Max 32px
    
    prefs.fontSize = `${currentSize}px`;
    saveReadingPreferences(prefs);
    
    const textContent = document.getElementById('chapter-text');
    const display = document.getElementById('font-size-display');
    
    if (textContent) {
        textContent.style.fontSize = prefs.fontSize;
    }
    if (display) {
        display.textContent = `${currentSize}px`;
    }
}

// Change font family
function changeFontFamily(fontFamily) {
    const prefs = loadReadingPreferences();
    prefs.fontFamily = fontFamily;
    saveReadingPreferences(prefs);
    
    const textContent = document.getElementById('chapter-text');
    if (textContent) {
        textContent.style.fontFamily = fontFamily;
    }
}

// Change reading theme
function changeTheme(theme) {
    const prefs = loadReadingPreferences();
    prefs.theme = theme;
    saveReadingPreferences(prefs);
    
    const container = document.getElementById('reader-container');
    if (container) {
        container.className = `reader-container theme-${theme}`;
    }
    
    // Update active button
    document.querySelectorAll('.btn-theme').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Setup scroll tracking for reading progress
function setupScrollTracking(novelId, chapterId) {
    let scrollTimeout;
    const container = document.getElementById('reader-container');
    
    if (!container) return;
    
    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            
            // Save progress to backend
            saveReadingProgress(novelId, chapterId, Math.round(scrollPercentage));
        }, 1000); // Save after 1 second of no scrolling
    });
}

// Save reading progress to backend
async function saveReadingProgress(novelId, chapterId, percentage) {
    if (!state.user) return;
    
    try {
        await api.readingProgress.save({
            novelId: novelId,
            chapterId: chapterId,
            scrollPosition: window.scrollY || 0,
            readingPercentage: percentage
        });
    } catch (error) {
        console.error('Failed to save reading progress:', error);
    }
}

// Navigate to previous chapter
function goToPreviousChapter() {
    const chapters = window.readerState.chapters || [];
    const currentChapterId = window.readerState.chapterId;
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
    const chapters = window.readerState.chapters || [];
    const currentChapterId = window.readerState.chapterId;
    const currentIndex = chapters.findIndex(ch => (ch.chapterId || ch.id) === currentChapterId);
    
    if (currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        const nextChapterId = nextChapter.chapterId || nextChapter.id;
        navigateTo(`#/reader/${window.readerState.novelId}/${nextChapterId}`);
    } else {
        showToast('This is the last chapter', 'info');
    }
}

// Handle chapter change from bottom dropdown
function handleBottomChapterChange() {
    const selector = document.getElementById('bottom-chapter-selector');
    if (selector && selector.value) {
        navigateTo(`#/reader/${window.readerState.novelId}/${selector.value}`);
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('reader-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--color-error);">${message}</p>
                <button class="btn btn-primary" onclick="navigateTo('#/home')">
                    Return to Home
                </button>
            </div>
        `;
    }
    hideSpinner();
}

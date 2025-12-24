// js/utils/searchRenderer.js
// Search Results Renderer

// Render search results in grid format
function renderSearchResults(novels, container, query = '') {
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    console.log('Rendering search results:', { novelCount: novels?.length, query, novels });
    
    // Clear previous results
    container.innerHTML = '';
    
    // Show empty state
    if (!novels || novels.length === 0) {
        console.warn('No novels to display in search results');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }
    
    // Render novel cards with highlighted search terms
    const cardsHTML = novels.map(novel => {
        return createNovelCardWithHighlight(novel, query);
    }).join('');
    
    console.log('Generated HTML for search results, inserting into container');
    container.innerHTML = cardsHTML;
}

// Create novel card with highlighted search terms
function createNovelCardWithHighlight(novel, query) {
    const highlightedTitle = highlightText(novel.title, query);
    const highlightedAuthor = highlightText(novel.author, query);
    
    // Support both mockData and backend DTO field names
    const id = novel.novelId || novel.id;
    const coverPath = novel.coverImage || novel.coverImageUrl;
    const cover = (coverPath && typeof getCoverImageUrl === 'function') 
        ? getCoverImageUrl(coverPath) 
        : (coverPath || 'assets/placeholder.png');
    const chapters = novel.chapterCount ?? novel.chapters ?? 0;
    const desc = novel.description || '';
    
    console.log('Creating search result card for novel:', { id, title: novel.title, coverPath, cover });
    
    // Use same styling as home page cards (comic-card class)
    return `
        <div class="comic-card" data-novel-id="${id}" onclick="navigateTo('#/novel/${id}')">
            <div class="comic-poster">
                <img src="${cover}" 
                     alt="${novel.title}"
                     loading="lazy">
                <div class="comic-overlay">
                </div>
            </div>
            <div class="comic-info">
                <h3 class="comic-title">${highlightedTitle}</h3>
                <p class="comic-author">By ${highlightedAuthor}</p>
                <p class="comic-description">
                    ${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}
                </p>
                <div class="comic-meta">
                    <span>${chapters} chapters</span>
                </div>
            </div>
        </div>
    `;
}

// Highlight matching text in search results
function highlightText(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// Escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Show loading state in search results
function showSearchLoading(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="search-loading">
            <div class="spinner-ring"></div>
            <p>Searching novels...</p>
        </div>
    `;
}

// Show error state in search results
function showSearchError(container, message = 'Failed to load search results') {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">
                Try Again
            </button>
        </div>
    `;
}

// Make functions globally available
window.renderSearchResults = renderSearchResults;
window.showSearchLoading = showSearchLoading;
window.showSearchError = showSearchError;
window.highlightText = highlightText;

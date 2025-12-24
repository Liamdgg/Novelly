// Helper function to convert stored cover path to file serving URL
function getCoverImageUrl(coverPath) {
    if (!coverPath) return 'assets/placeholder.png';
    
    // If it's already a full URL, return as-is
    if (coverPath.startsWith('http') || coverPath.startsWith('/api')) {
        return coverPath;
    }
    
    // Convert stored path (e.g., "novels/6/cover/uuid_filename.jpg") to API endpoint
    if (coverPath.includes('/cover/') || coverPath.startsWith('novels/')) {
        return `/api/pages/file?path=${encodeURIComponent(coverPath)}`;
    }
    
    return 'assets/placeholder.png';
}

// novel card for grid display
function createNovelCard(novel, options = {}) {
    // Support both mockData (id, coverImage, chapters) and backend DTO (novelId, coverImageUrl, chapterCount)
    const id = novel.novelId || novel.id;
    const cover = getCoverImageUrl(novel.coverImageUrl || novel.coverImage);
    const chapters = novel.chapterCount ?? novel.chapters ?? '...';
    const desc = novel.description || '';
    
    // Use firstChapterId if available, otherwise show novel details page
    const readLink = novel.firstChapterId 
        ? `#/reader/${id}/${novel.firstChapterId}` 
        : `#/novel/${id}`;
    
    // If chapters is not available, fetch it asynchronously
    if (chapters === '...') {
        setTimeout(async () => {
            try {
                const response = await api.chapters.getBynovelId(id);
                const chapterCount = Array.isArray(response) ? response.length : 0;
                const card = document.querySelector(`.comic-card[data-novel-id="${id}"] .comic-meta span`);
                if (card) {
                    card.textContent = `${chapterCount} chapters`;
                }
            } catch (e) {
                console.error('Failed to fetch chapter count:', e);
            }
        }, 0);
    }
    
    return `
        <div class="comic-card" data-novel-id="${id}">
            <div class="comic-poster" onclick="navigateTo('${readLink}')">
                <img src="${cover}" 
                     alt="${novel.title}"
                     loading="lazy">
                <div class="comic-overlay">
                </div>
            </div>
            <div class="comic-info">
                <h3 class="comic-title">${novel.title}</h3>
                <p class="comic-author">By ${novel.author}</p>
                <p class="comic-description">
                    ${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}
                </p>
                <div class="comic-meta">
                    <span>${chapters} chapters</span>
                </div>
                ${options.showRemoveButton ? `
                    <button class="btn btn-danger btn-sm" onclick="removeFromLibrary(${id}, event)" style="margin-top: 8px; width: 100%;">
                        Remove
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Chapter option for dropdown
function createChapterItem(chapter) {
    return `
        <option value="${chapter.chapterId}">
            Chapter ${chapter.chapterNumber}: ${chapter.title || 'Untitled'}
        </option>
    `;
}

// Swiper carousel slide
function createSwiperSlide(novel) {
    // Support both mockData and backend DTO
    const id = novel.novelId || novel.id;
    const cover = getCoverImageUrl(novel.coverImageUrl || novel.coverImage);
    
    // Use firstChapterId if available, otherwise show novel details page
    const readLink = novel.firstChapterId 
        ? `#/reader/${id}/${novel.firstChapterId}` 
        : `#/novel/${id}`;
    
    return `
        <div class="swiper-slide">
            <div class="swiper-card" onclick="navigateTo('${readLink}')">
                <img src="${cover}" 
                     alt="${novel.title}">
                <div class="swiper-caption">
                    <h4>${novel.title}</h4>
                    <p>${novel.author}</p>
                </div>
            </div>
        </div>
    `;
}

// Continue reading card
function createContinueReadingCard(history) {
    const progressPercent = (history.currentChapter / history.totalChapters) * 100;
    const cover = getCoverImageUrl(history.coverImage);
    
    return `
        <div class="continue-card" onclick="navigateTo('#/reader/${history.novelId}/${history.currentChapter}')">
            <img src="${cover}" alt="${history.title}">
            <div class="continue-info">
                <h4>${history.title}</h4>
                <p>Chapter ${history.currentChapter} of ${history.totalChapters}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${Math.round(progressPercent)}% Complete</span>
            </div>
        </div>
    `;
}


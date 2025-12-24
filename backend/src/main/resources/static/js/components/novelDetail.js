// Novel Detail Page - shows novel info and chapters
function renderNovelDetail() {
    return `
        ${renderHeader()}
        <main class="novel-detail-page">
            <div id="novel-detail-container" class="novel-detail-container">
                <div class="spinner">Loading novel...</div>
            </div>
        </main>
    `;
}

function initNovelDetail(params) {
    initHeader();
    const novelId = params.novelId || params;
    loadNovelDetail(novelId);
    if (appState.currentUser) {
        checkReadingProgress(novelId);
    }
}

// Store reading progress globally for this novel
let currentNovelProgress = null;

// Check if user has reading progress for this novel
async function checkReadingProgress(novelId) {
    if (!appState.currentUser) return;
    
    try {
        // Wait a bit for DOM to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const progress = await api.readingProgress.getByNovel(appState.currentUser.userId, novelId);
        currentNovelProgress = progress;
        console.log('Reading progress found:', progress);
        updateContinueReadingButton(novelId, progress);
    } catch (error) {
        console.log('No reading progress found:', error);
        currentNovelProgress = null;
    }
}

// Update the continue reading button if progress exists
function updateContinueReadingButton(novelId, progress) {
    const actionsDiv = document.querySelector('.novel-actions');
    if (!actionsDiv) {
        console.log('Actions div not found');
        return;
    }
    
    if (!progress || !progress.chapter) {
        console.log('No progress or chapter data');
        return;
    }
    
    // Remove existing continue button if any
    const existingBtn = actionsDiv.querySelector('.btn-success');
    if (existingBtn) existingBtn.remove();
    
    // Add continue reading button before the add to library button
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-success';
    continueBtn.innerHTML = `📖 Continue Reading (Chapter ${progress.chapter.chapterNumber})`;
    continueBtn.onclick = () => navigateTo(`#/reader/${novelId}/${progress.chapter.chapterId}`);
    
    actionsDiv.insertBefore(continueBtn, actionsDiv.firstChild);
    console.log('Continue reading button added');
}

async function loadNovelDetail(novelId) {
    const container = document.getElementById('novel-detail-container');
    if (!container) return;

    try {
        console.log('Loading novel:', novelId);
        
        // Validate novelId
        if (!novelId || novelId === ':novelId') {
            container.innerHTML = `<div class="error-message">Invalid novel ID</div>`;
            return;
        }
        
        const novel = await api.novels.getById(novelId);
        console.log('Novel fetched:', novel);
        
        if (!novel) {
            container.innerHTML = `<div class="error-message">Novel not found</div>`;
            return;
        }

        // Fetch chapters for this novel (non-blocking, with timeout)
        let chapters = [];
        try {
            console.log('[NovelDetail] Fetching chapters for novel:', novelId);
            console.log('[NovelDetail] Using API method:', api.chapters.getBynovelId);
            const chaptersResponse = await Promise.race([
                api.chapters.getBynovelId(novelId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            console.log('[NovelDetail] Raw chapters response:', chaptersResponse);
            chapters = Array.isArray(chaptersResponse) ? chaptersResponse : (chaptersResponse.content || []);
            console.log('[NovelDetail] Processed chapters array:', chapters);
            console.log('[NovelDetail] Number of chapters:', chapters.length);
        } catch (e) {
            console.error('[NovelDetail] Error fetching chapters:', e);
            chapters = [];
        }

        // Fetch review stats
        let reviewStats = { averageRating: 0, reviewCount: 0 };
        try {
            reviewStats = await api.reviews.getStats(novelId);
        } catch (e) {
            console.error('[NovelDetail] Error fetching review stats:', e);
        }

        const id = novel.novelId || novel.id;
        const cover = getCoverImageUrl(novel.coverImageUrl || novel.coverImage);
        const avgRating = reviewStats.averageRating || 0;
        const reviewCount = reviewStats.reviewCount || 0;

        container.innerHTML = `
            <div class="novel-detail">
                <div class="novel-detail-header">
                    <div class="novel-detail-cover">
                        <img src="${cover}" alt="${novel.title}">
                    </div>
                    <div class="novel-detail-info">
                        <h1>${novel.title}</h1>
                        <p class="novel-detail-author">By ${novel.author || 'Unknown'}</p>
                        <p class="novel-detail-description">${novel.description || 'No description'}</p>
                        <div class="novel-detail-stats">
                            <span>${chapters ? chapters.length : 0} chapters</span>
                            <span class="rating-display">${renderStars(avgRating)} ${avgRating.toFixed(1)} (${reviewCount} reviews)</span>
                        </div>
                        ${appState.currentUser ? `
                            <div class="novel-actions">
                                <button class="btn btn-primary" id="add-to-library-btn" onclick="addToLibrary(${id})">
                                    <span id="library-icon">📚</span> Add to Library
                                </button>
                            </div>
                        ` : `
                            <div class="novel-actions">
                                <button class="btn btn-secondary" onclick="navigateTo('#/login')">
                                    Login to Add to Library
                                </button>
                            </div>
                        `}
                    </div>
                </div>

                <div class="novel-chapters">
                    <h2>Chapters</h2>
                    ${chapters && chapters.length > 0 ? `
                        <div class="chapters-list">
                            ${chapters.map(chapter => `
                                <div class="chapter-item" onclick="navigateTo('#/reader/${id}/${chapter.chapterId}')">
                                    <span class="chapter-number">Ch. ${chapter.chapterNumber}</span>
                                    <span class="chapter-title">${chapter.title || 'Untitled'}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>No chapters available yet</p>
                        </div>
                    `}
                </div>

                <!-- Reviews Section -->
                <div class="novel-reviews" id="reviews-section">
                    <h2>Reviews & Ratings</h2>
                    
                    <!-- Add Review Form -->
                    ${appState.currentUser ? `
                        <div class="review-form">
                            <h3>Rate this novel</h3>
                            <div class="star-rating" id="star-rating">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <span class="star" data-rating="${star}" onclick="setRating(${star})">☆</span>
                                `).join('')}
                            </div>
                            <textarea 
                                id="review-comment" 
                                class="review-textarea" 
                                placeholder="Share your thoughts about this novel... (optional)"
                                maxlength="500"
                            ></textarea>
                            <div class="review-form-actions">
                                <span class="char-count"><span id="review-char-count">0</span>/500</span>
                                <button class="btn btn-primary" onclick="submitReview(${id})">Submit Review</button>
                            </div>
                        </div>
                    ` : `
                        <div class="login-prompt">
                            <p>Please <a href="#/login">log in</a> to leave a review</p>
                        </div>
                    `}

                    <!-- Reviews List -->
                    <div id="reviews-list" class="reviews-list">
                        <div class="spinner">Loading reviews...</div>
                    </div>
                </div>
            </div>
        `;

        // Setup review form character counter
        const reviewTextarea = document.getElementById('review-comment');
        const reviewCharCount = document.getElementById('review-char-count');
        if (reviewTextarea && reviewCharCount) {
            reviewTextarea.addEventListener('input', () => {
                reviewCharCount.textContent = reviewTextarea.value.length;
            });
        }

        // Load reviews
        loadReviews(novelId);

    } catch (error) {
        console.error('Error loading novel:', error);
        container.innerHTML = `<div class="error-message">Failed to load novel: ${error.message}</div>`;
    }
}

// Helper function to render stars
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (halfStar) {
        stars += '☆';
    }
    for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
        stars += '☆';
    }
    
    return stars;
}

// Set rating for review form
let selectedRating = 0;
function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('#star-rating .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Submit review
async function submitReview(novelId) {
    if (selectedRating === 0) {
        showToast('Please select a rating', 'warning');
        return;
    }

    const comment = document.getElementById('review-comment')?.value.trim();
    
    try {
        showSpinner('Submitting review...');
        await api.reviews.create(novelId, selectedRating, comment);
        hideSpinner();
        showToast('Review submitted successfully!', 'success');
        
        // Reset form
        selectedRating = 0;
        setRating(0);
        document.getElementById('review-comment').value = '';
        document.getElementById('review-char-count').textContent = '0';
        
        // Reload reviews
        loadReviews(novelId);
        
    } catch (error) {
        hideSpinner();
        console.error('Error submitting review:', error);
        showToast('Failed to submit review', 'error');
    }
}

// Load reviews list
async function loadReviews(novelId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    try {
        const reviews = await api.reviews.getByNovel(novelId);
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state">
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            `;
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-user">
                        <div class="review-avatar">${review.username.substring(0, 2).toUpperCase()}</div>
                        <span class="review-username">${review.username}</span>
                    </div>
                    <div class="review-rating">${renderStars(review.rating)}</div>
                </div>
                ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = `<div class="error-message">Failed to load reviews</div>`;
    }
}

// Add novel to library function
window.addToLibrary = async function(novelId) {
    const btn = document.getElementById('add-to-library-btn');
    const icon = document.getElementById('library-icon');
    
    if (!appState.currentUser) {
        navigateTo('#/login');
        return;
    }
    
    try {
        btn.disabled = true;
        icon.textContent = '⏳';
        
        // Call backend API to add to library
        const response = await fetch(`/api/users/${appState.currentUser.userId}/library/${novelId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appState.jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            icon.textContent = '✅';
            btn.textContent = '✅ Added to Library';
            setTimeout(() => {
                icon.textContent = '📚';
                btn.textContent = '📚 In Library';
                btn.disabled = true;
            }, 1500);
            showToast('Novel added to library!', 'success');
        } else if (response.status === 409) {
            // Already in library
            icon.textContent = '📚';
            btn.textContent = '📚 Already in Library';
            btn.disabled = true;
            showToast('Novel is already in your library', 'info');
        } else {
            throw new Error('Failed to add to library');
        }
    } catch (error) {
        console.error('Error adding to library:', error);
        icon.textContent = '❌';
        btn.textContent = '❌ Failed';
        setTimeout(() => {
            icon.textContent = '📚';
            btn.textContent = '📚 Add to Library';
            btn.disabled = false;
        }, 2000);
        showToast('Failed to add to library. Please try again.', 'error');
    }
};

// Make functions globally available
window.renderNovelDetail = renderNovelDetail;
window.initNovelDetail = initNovelDetail;
window.setRating = setRating;
window.submitReview = submitReview;

// js/api.js - API Client Updates for Novelly

// Add these new API sections to your existing api.js file:

// Reading Progress API
readingProgress: {
    // Get all reading progress for current user
    getAll: async function() {
        return await this.request('/api/reading-progress', 'GET');
    },
    
    // Get reading progress for a specific novel
    getByNovelId: async function(novelId) {
        return await this.request(`/api/reading-progress/novel/${novelId}`, 'GET');
    },
    
    // Save/update reading progress
    save: async function(progressData) {
        // progressData = { novelId, chapterId, scrollPosition, readingPercentage }
        return await this.request('/api/reading-progress', 'POST', progressData);
    },
    
    // Get recently read novels
    getRecent: async function() {
        return await this.request('/api/reading-progress/recent', 'GET');
    }
},

// Library API
library: {
    // Get user's library
    getAll: async function() {
        return await this.request('/api/library', 'GET');
    },
    
    // Add novel to library
    add: async function(novelId) {
        return await this.request(`/api/library/${novelId}`, 'POST');
    },
    
    // Remove novel from library
    remove: async function(novelId) {
        return await this.request(`/api/library/${novelId}`, 'DELETE');
    },
    
    // Check if novel is in library
    check: async function(novelId) {
        return await this.request(`/api/library/check/${novelId}`, 'GET');
    }
},

// Reviews API
reviews: {
    // Get all reviews for a novel
    getByNovelId: async function(novelId) {
        return await this.request(`/api/reviews/novel/${novelId}`, 'GET');
    },
    
    // Get average rating for a novel
    getAverageRating: async function(novelId) {
        return await this.request(`/api/reviews/novel/${novelId}/average`, 'GET');
    },
    
    // Create or update review
    save: async function(reviewData) {
        // reviewData = { novelId, rating (1-5) }
        return await this.request('/api/reviews', 'POST', reviewData);
    },
    
    // Delete review
    delete: async function(reviewId) {
        return await this.request(`/api/reviews/${reviewId}`, 'DELETE');
    }
},

// Update existing Chapters API to fetch content
chapters: {
    // Get all chapters for a novel
    getByNovelId: async function(novelId) {
        return await this.request(`/api/chapters/novel/${novelId}`, 'GET');
    },
    
    // Get chapter by ID (includes full text content)
    getById: async function(chapterId) {
        return await this.request(`/api/chapters/${chapterId}`, 'GET');
    },
    
    // Admin: Create chapter
    create: async function(chapterData) {
        // chapterData = { novelId, chapterNumber, title, content }
        return await this.request('/api/chapters', 'POST', chapterData);
    },
    
    // Admin: Update chapter
    update: async function(chapterId, chapterData) {
        return await this.request(`/api/chapters/${chapterId}`, 'PUT', chapterData);
    },
    
    // Admin: Delete chapter
    delete: async function(chapterId) {
        return await this.request(`/api/chapters/${chapterId}`, 'DELETE');
    }
}

// Note: Remove the old 'pages' API section as it's no longer needed

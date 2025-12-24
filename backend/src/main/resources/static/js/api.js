// js/api.js
// API Client for Backend Communication

// Base URL for API (adjust if backend runs on different port)
const API_BASE_URL = '/api';

// Generic API request wrapper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
        ...options.headers
    };
    
    // Add Authorization header if JWT token exists
    if (appState.jwtToken) {
        headers['Authorization'] = `Bearer ${appState.jwtToken}`;
    }
    
    // Add Content-Type for JSON if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Make request
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle different response types
        const contentType = response.headers.get('content-type');
        
        // Check if response is OK (status 200-299)
        if (!response.ok) {
            // Try to parse error message
            let errorMessage = `Request failed with status ${response.status}`;
            
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }
        
        // Parse response based on content type
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text/')) {
            return await response.text();
        } else {
            // For binary data (images, etc.)
            return await response.blob();
        }
        
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Helper functions for different HTTP methods

function get(endpoint, queryParams = {}) {
    // Build query string
    const queryString = Object.keys(queryParams)
        .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
    
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return apiRequest(url, {
        method: 'GET'
    });
}

function post(endpoint, data, isFormData = false) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data)
    });
}

function put(endpoint, data, isFormData = false) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data)
    });
}

function del(endpoint) {
    return apiRequest(endpoint, {
        method: 'DELETE'
    });
}

// ===========================================
// API ENDPOINTS
// ===========================================

// Auth API
const authAPI = {
    // POST /api/auth/register
    register: (username, email, password) => 
        post('/auth/register', { username, email, password }),
    
    // POST /api/auth/login
    // Note: backend expects `emailOrUsername` in the LoginRequest DTO
    login: (emailOrUsername, password) => 
        post('/auth/login', { emailOrUsername, password }),
    
    // GET /api/auth/me
    getCurrentUser: () => 
        get('/auth/me'),
    
    // Debug endpoint (remove in production)
    inspectToken: () => 
        get('/auth/inspect')
};

// novels API
const NovelsAPI = {
    // GET /api/novels (returns List<Novel>)
    // Note: Backend only uses 'q' parameter for search, ignores page/size
    getAll: (page = 0, size = 12, search = '') => {
        const params = {};
        if (search && search.trim()) {
            params.q = search.trim();
        }
        return get('/novels', params);
    },
    
    // GET /api/novels/{id}
    getById: (novelId) => 
        get(`/novels/${novelId}`),
    
    // POST /api/novels (JSON - admin)
    create: (NovelData) => 
        post('/novels', NovelData),
    
    // POST /api/novels/upload (multipart - admin, with cover)
    upload: (formData) => 
        post('/novels/upload', formData, true),
    
    // PUT /api/novels/{id} (multipart - admin, update novel)
    update: (novelId, formData) => 
        put(`/novels/${novelId}`, formData, true),
    
    // DELETE /api/novels/{id} (admin)
    delete: (novelId) => 
        del(`/novels/${novelId}`)
};

// Chapters API
const chaptersAPI = {
    // GET /api/novels/{novelId}/chapters
    getBynovelId: (novelId) => 
        get(`/novels/${novelId}/chapters`),
    
    // GET /api/novels/{novelId}/chapters/{chapterNumber} - Get chapter by number
    getByNumber: (novelId, chapterNumber) =>
        get(`/novels/${novelId}/chapters/${chapterNumber}`),
    
    // GET chapter by ID (uses chapterId directly)
    getById: (chapterId) =>
        get(`/chapters/${chapterId}`),
    
    // POST /api/novels/{novelId}/chapters (admin)
    create: (novelId, chapterData) => 
        post(`/novels/${novelId}/chapters`, chapterData),
    
    // DELETE /api/chapters/{chapterId} (admin)
    delete: (chapterId) => 
        del(`/chapters/${chapterId}`)
};

// Pages API
const pagesAPI = {
    // GET /api/pages?chapterId={chapterId}
    getByChapterId: (chapterId) => 
        get('/pages', { chapterId }),
    
    // POST /api/pages/upload (single page - admin)
    uploadSingle: (formData) => 
        post('/pages/upload', formData, true),
    
    // POST /api/pages/upload-multiple (bulk upload - admin)
    uploadMultiple: (formData) => 
        post('/pages/upload-multiple', formData, true),
    
    // GET /api/pages/file?path={path}
    getFileUrl: (path) => 
        `${API_BASE_URL}/pages/file?path=${encodeURIComponent(path)}`,
    
    // DELETE /api/pages/{pageId} (admin)
    delete: (pageId) => 
        del(`/pages/${pageId}`)
};

// Reading Progress API
const readingProgressAPI = {
    // GET /api/users/{userId}/progress
    getAll: (userId) =>
        get(`/users/${userId}/progress`),

    // GET /api/users/{userId}/progress/{novelId}
    getByNovel: (userId, novelId) =>
        get(`/users/${userId}/progress/${novelId}`),

    // POST /api/users/{userId}/progress
    save: (userId, data) =>
        post(`/users/${userId}/progress`, data),

    // DELETE /api/users/{userId}/progress/{novelId}
    remove: (userId, novelId) =>
        del(`/users/${userId}/progress/${novelId}`)
};

// Comments API
const commentsAPI = {
    // GET /api/novels/{novelId}/comments
    getByNovel: (novelId) => 
        get(`/novels/${novelId}/comments`),
    
    // POST /api/novels/{novelId}/comments
    create: (novelId, content) => 
        post(`/novels/${novelId}/comments`, { content }),
    
    // PUT /api/comments/{commentId}
    update: (commentId, content) => 
        put(`/comments/${commentId}`, { content }),
    
    // DELETE /api/comments/{commentId}
    delete: (commentId) => 
        del(`/comments/${commentId}`)
};

// Users API (admin)
const usersAPI = {
    // GET /api/users (admin only)
    getAll: () => 
        get('/users'),
    
    // GET /api/users/{id}
    getById: (userId) => 
        get(`/users/${userId}`)
};

// Reviews API
const reviewsAPI = {
    // GET /api/reviews/novel/{novelId}
    getByNovel: (novelId) =>
        get(`/reviews/novel/${novelId}`),
    
    // GET /api/reviews/novel/{novelId}/stats
    getStats: (novelId) =>
        get(`/reviews/novel/${novelId}/stats`),
    
    // POST /api/reviews/novel/{novelId}
    create: (novelId, rating, comment) =>
        post(`/reviews/novel/${novelId}`, { rating, comment }),
    
    // DELETE /api/reviews/{reviewId}
    delete: (reviewId) =>
        del(`/reviews/${reviewId}`)
};

// Export API object
const api = {
    auth: authAPI,
    novels: NovelsAPI,
    chapters: chaptersAPI,
    pages: pagesAPI,
    readingProgress: readingProgressAPI,
    comments: commentsAPI,
    users: usersAPI,
    reviews: reviewsAPI
};

// Make available globally
window.api = api;

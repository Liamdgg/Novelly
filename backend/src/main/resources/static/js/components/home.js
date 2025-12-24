/* ===== HOME.JS - Updated to use mockData ===== */

// State
let currentPage = 1;
let totalPages = 1;
let NovelsPerPage = 12;

function renderHome() {
    return `
        ${renderHeader()}
        <main class="home-page">
            <!-- Latest Released Carousel -->
            <section id="carousel-section" class="section-carousel">
                <div class="section-header">
                    <h2>Popular Novels</h2>
                </div>
                <div id="carousel-container" class="carousel-container"></div>
            </section>
            
            <!-- All novels Grid -->
            <section id="novels-section" class="section-novels">
                <div class="section-header">
                    <h2>All novels</h2>
                </div>
                <div id="novels-grid" class="novels-grid"></div>
                <div id="pagination" class="pagination hidden">
                    <button class="btn btn-secondary" id="prev-btn" onclick="goToPrevPage()" disabled>
                        ← Previous
                    </button>
                    <span id="page-info" class="page-info"></span>
                    <button class="btn btn-secondary" id="next-btn" onclick="goToNextPage()">
                        Next →
                    </button>
                </div>
            </section>
        </main>
    `;
}

function initrenderHome() {
    initHeader();
    loadLatestNovels();
    loadAllNovels();
}

// Load latest novels
async function loadLatestNovels() {
    const container = document.getElementById('carousel-container');
    if (!container) return;
    
    try {
        // Fetch first page of novels (latest first)
        const response = await api.novels.getAll(0, 10, '');
        // Backend returns array, take first 10
        const latestNovels = Array.isArray(response) ? response.slice(0, 10) : (response.content || []);
        initSwiper('carousel-container', latestNovels);
    } catch (error) {
        console.error('Error loading latest novels:', error);
        container.innerHTML = `<div class="error-message">Failed to load latest novels</div>`;
    }
}

// Load all novels with pagination
async function loadAllNovels(page = 1) {
    const grid = document.getElementById('novels-grid');
    if (!grid) return;
    
    try {
        grid.innerHTML = Spinner({ message: 'Loading novels...' });
        
        // Fetch from API - returns full array
        const response = await api.novels.getAll(page - 1, NovelsPerPage, '');
        
        // Handle both array and paginated response formats
        const allNovels = Array.isArray(response) ? response : (response.content || []);
        currentPage = page;
        totalPages = Math.ceil(allNovels.length / NovelsPerPage) || 1;
        
        if (!allNovels || allNovels.length === 0) {
            grid.innerHTML = `<div class="empty-state"><h3>No novels found</h3></div>`;
            document.getElementById('pagination').classList.add('hidden');
            return;
        }
        
        // Manually handle pagination for array response
        const startIndex = (page - 1) * NovelsPerPage;
        const endIndex = startIndex + NovelsPerPage;
        const paginatedNovels = allNovels.slice(startIndex, endIndex);
        
        grid.innerHTML = paginatedNovels.map(novel => createNovelCard(novel)).join('');
        updatePagination();
        
    } catch (error) {
        console.error('Error loading novels:', error);
        grid.innerHTML = `<div class="error-message">Failed to load novels</div>`;
    }
}

// Pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (!pagination) return;
    
    pagination.classList.remove('hidden');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        loadAllNovels(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        loadAllNovels(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Make global
window.goToPrevPage = goToPrevPage;
window.goToNextPage = goToNextPage;

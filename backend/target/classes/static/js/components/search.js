// js/components/search.js
// Search Page Renderer

let searchDebounceTimer = null;

function renderSearch(params, queryParams) {
    const searchQuery = queryParams?.q || '';
    
    return `
        ${renderHeader()}
        <main class="search-page">
            <div class="search-container">
                <h1>Search Results</h1>
                
                <div id="search-results" class="novels-grid">
                    ${searchQuery ? '<p>Loading results...</p>' : '<div class="search-prompt"><p>Enter a search term in the header to find novels</p></div>'}
                </div>
            </div>
        </main>
    `;
}

// Initialize search page
function initrenderSearch(params, queryParams) {
    initHeader();
    
    const resultsContainer = document.getElementById('search-results');
    
    // Check if we have pre-fetched results from header search
    if (appState.searchResults && appState.searchQuery) {
        const query = appState.searchQuery;
        const results = appState.searchResults;
        
        // Clear the stored results
        delete appState.searchResults;
        delete appState.searchQuery;
        
        // Display the results immediately
        renderSearchResults(results, resultsContainer, query);
    } else if (queryParams?.q && queryParams.q.trim()) {
        // Fallback: fetch results if navigated directly to URL
        fetchSearchResults(queryParams.q);
    } else {
        showSearchPrompt();
    }
}



async function fetchSearchResults(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) {
        console.error('Search results container not found!');
        return;
    }
    
    console.log('Fetching search results for query:', query);
    
    try {
        // Show loading state
        showSearchLoading(resultsContainer);
        
        // Call API search endpoint
        console.log('Calling API with query:', query);
        const response = await api.novels.getAll(0, 50, query);
        console.log('API response received:', response);
        
        // Backend returns List<Novel> directly, not a paginated response
        const results = Array.isArray(response) ? response : (response.content || []);
        console.log('Processed results:', { count: results.length, results });
        
        // Render results with highlighting
        renderSearchResults(results, resultsContainer, query);
        
    } catch (error) {
        console.error('Search error:', error);
        showSearchError(resultsContainer, 'Failed to search novels. Please try again.');
    }
}

function showSearchPrompt() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="search-prompt">
                <h3>Start Searching</h3>
                <p>Use the search bar in the header to find novels by title or author</p>
            </div>
        `;
    }
}

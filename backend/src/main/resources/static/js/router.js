// Route definitions
const routes = {
    '/': {
        component: 'renderHome',
        requiresAuth: false,
        redirect: () => '/home'
    },
    '/login': {
        component: 'renderLogin',
        requiresAuth: false,
        onlyGuest: true  // Redirect to /home if already logged in
    },
    '/register': {
        component: 'renderRegister',
        requiresAuth: false,
        onlyGuest: true
    },
    '/home': {
        component: 'renderHome',
        requiresAuth: false
    },
    '/novel/:novelId': {
        component: 'renderNovelDetail',
        requiresAuth: false,
        params: ['novelId']
    },
    '/reader/:novelId/:chapterId': {
        component: 'renderReader',
        requiresAuth: true,
        params: ['novelId', 'chapterId']  // Dynamic segments
    },
    '/admin': {
        component: 'renderAdmin',
        requiresAuth: true,
        requiresRole: ['ADMIN']  // Only admins can access
    },
    '/search': {
        component: 'renderSearch'
        // No auth required - let visitors search and browse
    },
    '/profile': {
        component: 'renderProfile',
        requiresAuth: true
    },
    '/library': {
        component: 'renderLibrary',
        requiresAuth: true
    },
    '/edit-profile': {
        component: 'renderEditProfile',
        requiresAuth: true
    }
};

// Parse current hash into route + params
function parseRoute() {
    // Get hash without the #
    const hash = window.location.hash.slice(1) || '/';
    
    // Split into path and query string
    const [path, queryString] = hash.split('?');
    
    // Parse query parameters (?search=batman&page=2)
    const queryParams = {};
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            queryParams[key] = decodeURIComponent(value);
        });
    }
    
    return { path, queryParams };
}

// Match URL path to route definition
function matchRoute(path) {
    // Try exact match first
    if (routes[path]) {
        return { route: routes[path], params: {} };
    }
    
    // Try pattern matching for dynamic routes
    for (const [pattern, route] of Object.entries(routes)) {
        const regex = pathToRegex(pattern);
        const match = path.match(regex);
        
        if (match) {
            const params = extractParams(pattern, match);
            return { route, params };
        }
    }
    
    // No match found
    return null;
}

// Convert route pattern to regex
function pathToRegex(path) {
    // Escape special regex characters
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace :param with capture group
    const pattern = escaped.replace(/:(\w+)/g, '([^/]+)');
    
    // Match exact path
    return new RegExp(`^${pattern}$`);
}

// Extract params from regex match
function extractParams(pattern, match) {
    const params = {};
    const paramNames = [];
    
    // Find all :param in pattern
    pattern.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
    });
    
    // Map captured values to param names
    paramNames.forEach((name, index) => {
        params[name] = match[index + 1]; // match[0] is full match, params start at [1]
    });
    
    return params;
}

// Check if user can access route
function canAccessRoute(route) {
    // Check authentication
    if (route.requiresAuth && !appState.isAuthenticated) {
        return { allowed: false, redirect: '/login' };
    }
    
    // Check if route is guest-only (login/register when already logged in)
    if (route.onlyGuest && appState.isAuthenticated) {
        return { allowed: false, redirect: '/home' };
    }
    
    // Check role requirement (supports string or array of allowed roles)
    if (route.requiresRole) {
        const allowedRoles = Array.isArray(route.requiresRole) ? route.requiresRole : [route.requiresRole];
        if (!allowedRoles.includes(appState.currentUser?.role)) {
            return { allowed: false, redirect: '/home' };
        }
    }
    
    return { allowed: true };
}

// Render the component for matched route
function renderRoute(route, params, queryParams) {
    const pageContent = document.getElementById('page-content');
    
    // Show loading spinner
    showSpinner('Loading page...');
    
    // Get component render function
    const componentName = route.component;
    const renderFunction = window[componentName];
    
    if (!renderFunction) {
        console.error(`Component ${componentName} not found`);
        pageContent.innerHTML = '<h1>Error: Component not found</h1>';
        hideSpinner();
        return;
    }
    
    // Call render function with params
    try {
        const html = renderFunction(params, queryParams);
        pageContent.innerHTML = html;
        
        // Initialize component (attach event listeners, etc.)
        // Try multiple init function naming conventions
        const initFunctionName = componentName.replace(/^render/, 'init');
        const initFunction = window[initFunctionName] || window[`init${componentName}`];
        
        if (initFunction && typeof initFunction === 'function') {
            // Call init with params if it exists
            initFunction(params, queryParams);
        }
        
        hideSpinner();
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error rendering component:', error);
        pageContent.innerHTML = '<h1>Error loading page</h1>';
        hideSpinner();
    }
}

// Navigate to a route
function navigateTo(hash) {
    // Update URL hash (triggers hashchange event)
    window.location.hash = hash;
}

// Handle route change
function handleRouteChange() {
    // Parse current hash
    const { path, queryParams } = parseRoute();
    
    console.log('Route changed to:', path);
    
    // Match route
    const match = matchRoute(path);
    
    // Handle 404
    if (!match) {
        handle404();
        return;
    }
    
    const { route, params } = match;
    
    // Check if user can access this route
    const access = canAccessRoute(route);
    if (!access.allowed) {
        console.log('Access denied, redirecting to:', access.redirect);
        navigateTo(access.redirect);
        return;
    }
    
    // Check for redirect
    if (route.redirect) {
        const redirectPath = route.redirect();
        if (redirectPath !== path) {
            navigateTo(redirectPath);
            return;
        }
    }
    
    // Render component
    renderRoute(route, params, queryParams);
}

// Handle 404 - route not found
function handle404() {
    const pageContent = document.getElementById('page-content');
    
    // Check if authenticated to decide redirect
    if (appState.isAuthenticated) {
        showToast('Page not found, redirecting to home...', 'warning');
        setTimeout(() => navigateTo('/home'), 2000);
    } else {
        showToast('Page not found, redirecting to login...', 'warning');
        setTimeout(() => navigateTo('/login'), 2000);
    }
    
    // Show 404 page
    pageContent.innerHTML = `
        <div class="error-page">
            <h1>404</h1>
            <p>Page not found</p>
            <p>Redirecting...</p>
        </div>
    `;
}

// Initialize router
function initRouter() {
    // Initialize state from localStorage
    initializeState();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);
    
    // Handle initial route on page load
    handleRouteChange();
    
    console.log('Router initialized');
}

// Make navigateTo globally available
window.navigateTo = navigateTo;




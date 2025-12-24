/* ===== MOCKDATA.JS - Centralized Mock Data for Testing ===== */

// Mock user data
const mockUser = {
    id: 1,
    username: 'admin_user',
    email: 'admin@example.com',
    avatar: null,
    role: 'ADMIN', // or 'USER'
    token: 'mock-admin-token-12345'
};

// Mock novels list (using actual assets)
const NovelImages = [
    'assets/Suisei 112.jpg', 'assets/Suisei 113.jpg', 'assets/Suisei 114.jpg', 'assets/Suisei 115.jpg',
    'assets/Suisei 116.jpg', 'assets/Suisei 117.jpg', 'assets/Suisei 118.jpg', 'assets/Suisei 119.jpg',
    'assets/Suisei 120.jpg', 'assets/Suisei 121.jpg', 'assets/Suisei 122.jpg', 'assets/Suisei 123.jpg',
    'assets/Suisei 124.jpg', 'assets/Suisei 125.jpg', 'assets/Suisei 126.jpg', 'assets/Suisei 127.jpg',
    'assets/Suisei 128.jpg', 'assets/Suisei 129.jpg', 'assets/Suisei 130.jpg', 'assets/Suisei 131.jpg',
    'assets/Suisei 132.jpg', 'assets/Suisei 133.jpg', 'assets/Suisei 134.jpg', 'assets/Suisei 135.jpg',
    'assets/Suisei 136.jpg', 'assets/Suisei 137.jpg', 'assets/Suisei 138.jpg', 'assets/Suisei 139.jpg',
    'assets/Suisei 140.jpg', 'assets/Suisei 141.jpg', 'assets/Suisei 142.jpg', 'assets/Suisei 143.jpg',
    'assets/Suisei 144.jpg', 'assets/Suisei 145.jpg', 'assets/Suisei 146.jpg', 'assets/Suisei 147.jpg',
    'assets/Suisei 148.png', 'assets/Suisei 149.jpg', 'assets/Suisei 150.jpg', 'assets/Suisei 151.jpg',
    'assets/Suisei 152.jpg', 'assets/Suisei 153.jpg', 'assets/Suisei 154.jpg', 'assets/Suisei 155.jpg',
    'assets/Suisei 156.jpg', 'assets/Suisei 157.jpg', 'assets/Suisei 158.jpg', 'assets/Suisei 159.jpg',
    'assets/Suisei 160.jpg', 'assets/Suisei 161.jpg'
];

const mockNovels = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Stellar Chronicles ${i + 1}`,
    author: `Hoshimachi Suisei`,
    coverImage: NovelImages[i % NovelImages.length],
    description: `An epic tale of adventure and mystery. Follow the journey through chapter ${i + 1} as our heroes face incredible challenges and discover hidden truths about their world.`,
    chapters: Math.floor(Math.random() * 50) + 5,
    rating: (Math.random() * 2 + 3).toFixed(1),
    views: Math.floor(Math.random() * 100000) + 1000,
    updatedAt: new Date(Date.now() - (i * 86400000)).toISOString() // Each novel 1 day apart
}));

// Mock latest novels (newest 10)
const mockLatestNovels = mockNovels.slice(0, 10);

// Mock reading history
const mockReadingHistory = [
    {
        novelId: 1,
        title: "Stellar Chronicles 1",
        coverImage: "assets/Suisei 112.jpg",
        currentChapter: 3,
        totalChapters: 12,
        lastRead: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        novelId: 5,
        title: "Stellar Chronicles 5",
        coverImage: "assets/Suisei 116.jpg",
        currentChapter: 7,
        totalChapters: 15,
        lastRead: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
        novelId: 10,
        title: "Stellar Chronicles 10",
        coverImage: "assets/Suisei 121.jpg",
        currentChapter: 2,
        totalChapters: 20,
        lastRead: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
];

// Mock chapters for a novel
function getMockChapters(novelId) {
    const totalChapters = mockNovels[novelId - 1]?.chapters || 10;
    
    return Array.from({ length: totalChapters }, (_, i) => ({
        chapterId: i + 1,
        title: `Chapter ${i + 1}`,
        pages: Math.floor(Math.random() * 30) + 10, // 10-40 pages per chapter
        uploadedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
}

// Mock chapter pages (images)
function getMockChapterPages(novelId, chapterId) {
    return Array.from({ length: 20 }, (_, i) => ({
        pageNumber: i + 1,
        imageUrl: `https://via.placeholder.com/800x1200/2c3e50/ecf0f1?text=Page+${i + 1}`
    }));
}

// Mock comments
const mockComments = [
    {
        id: 1,
        userId: 2,
        username: 'user123',
        avatar: null,
        text: 'This chapter was amazing! The plot twist got me.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 12
    },
    {
        id: 2,
        userId: 3,
        username: 'Novelfan456',
        avatar: null,
        text: 'When is the next chapter coming?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        likes: 5
    },
    {
        id: 3,
        userId: 4,
        username: 'manga_lover',
        avatar: null,
        text: 'The art style in this chapter is top-notch!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        likes: 23
    }
];

// Function to get paginated novels
function getPaginatedNovels(page = 1, limit = 12, sort = 'latest') {
    let novels = [...mockNovels];
    
    // Apply sorting
    switch(sort) {
        case 'popular':
            novels.sort((a, b) => b.id - a.id); // Mock: newer = more popular
            break;
        case 'title':
            novels.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'latest':
        default:
            novels.reverse();
    }
    
    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedNovels = novels.slice(start, end);
    
    return {
        novels: paginatedNovels,
        currentPage: page,
        totalPages: Math.ceil(novels.length / limit),
        totalNovels: novels.length
    };
}

// Function to search novels
function searchNovels(query) {
    const lowerQuery = query.toLowerCase();
    
    return mockNovels.filter(novel => 
        novel.title.toLowerCase().includes(lowerQuery) ||
        novel.author.toLowerCase().includes(lowerQuery) ||
        novel.description.toLowerCase().includes(lowerQuery)
    );
}

// Make available globally
window.mockData = {
    user: mockUser,
    novels: mockNovels,
    latestNovels: mockLatestNovels,
    readingHistory: mockReadingHistory,
    comments: mockComments,
    getMockChapters,
    getMockChapterPages,
    getPaginatedNovels,
    searchNovels
};

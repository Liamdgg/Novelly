#!/usr/bin/env powershell

# POSTMAN API TESTING GUIDE FOR NOVELLY
# ======================================

# NOTE: Make sure backend is running on http://localhost:8080
# Run with: cd backend && ./mvnw spring-boot:run

# ======================================
# 1. AUTHENTICATION
# ======================================

# LOGIN - Get JWT Token
# POST http://localhost:8080/api/auth/login
# Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}

# Response will include:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "username": "admin",
#   "roles": ["ADMIN"]
# }

# SAVE THIS TOKEN - You'll use it for all protected endpoints
# Add to Headers: Authorization: Bearer {token}


# ======================================
# 2. NOVELS ENDPOINTS
# ======================================

# GET ALL NOVELS (Public)
# GET http://localhost:8080/api/novels

# GET SINGLE NOVEL
# GET http://localhost:8080/api/novels/1

# CREATE NOVEL (Admin Only - requires image upload)
# POST http://localhost:8080/api/novels/upload
# Headers: Authorization: Bearer {token}
# Body: form-data
#   - title: "The Great Adventure"
#   - author: "Jane Doe"
#   - description: "An epic tale of adventure and discovery"
#   - cover: (select an image file)

# UPDATE NOVEL
# PUT http://localhost:8080/api/novels/1
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "title": "The Great Adventure Updated",
  "author": "Jane Doe",
  "description": "Updated description"
}

# DELETE NOVEL
# DELETE http://localhost:8080/api/novels/1
# Headers: Authorization: Bearer {token}


# ======================================
# 3. CHAPTERS ENDPOINTS (NEW)
# ======================================

# GET ALL CHAPTERS FOR A NOVEL
# GET http://localhost:8080/api/novels/1/chapters
# Response: List of chapters with text content

# GET SPECIFIC CHAPTER
# GET http://localhost:8080/api/novels/1/chapters/1

# CREATE CHAPTER WITH TEXT CONTENT (Admin Only)
# POST http://localhost:8080/api/novels/1/chapters
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "chapterNumber": 1,
  "title": "Chapter 1: The Beginning",
  "content": "This is the full text content of chapter 1. It contains the complete story text for this chapter. Minimum 100 characters required. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
}

# UPDATE CHAPTER
# PUT http://localhost:8080/api/novels/1/chapters/1
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "title": "Chapter 1: The Beginning Updated",
  "content": "Updated chapter content..."
}

# DELETE CHAPTER
# DELETE http://localhost:8080/api/novels/1/chapters/1
# Headers: Authorization: Bearer {token}


# ======================================
# 4. LIBRARY ENDPOINTS
# ======================================

# GET USER'S LIBRARY (Bookmarks)
# GET http://localhost:8080/api/users/{userId}/library
# Headers: Authorization: Bearer {token}

# ADD NOVEL TO LIBRARY
# POST http://localhost:8080/api/users/{userId}/library?novelId=1
# Headers: Authorization: Bearer {token}

# REMOVE NOVEL FROM LIBRARY
# DELETE http://localhost:8080/api/users/{userId}/library?novelId=1
# Headers: Authorization: Bearer {token}


# ======================================
# 5. READING PROGRESS ENDPOINTS
# ======================================

# GET READING PROGRESS
# GET http://localhost:8080/api/users/{userId}/reading-progress?novelId=1
# Headers: Authorization: Bearer {token}

# UPDATE READING PROGRESS (Save bookmark)
# PUT http://localhost:8080/api/users/{userId}/reading-progress?novelId=1
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "chapterId": 1,
  "scrollPosition": 250,
  "readingPercentage": 45.50
}


# ======================================
# 6. REVIEWS ENDPOINTS
# ======================================

# GET REVIEWS FOR NOVEL
# GET http://localhost:8080/api/novels/1/reviews

# CREATE REVIEW (1-5 stars)
# POST http://localhost:8080/api/novels/1/reviews
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "rating": 5
}

# UPDATE REVIEW
# PUT http://localhost:8080/api/novels/1/reviews
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "rating": 4
}

# DELETE REVIEW
# DELETE http://localhost:8080/api/novels/1/reviews
# Headers: Authorization: Bearer {token}


# ======================================
# 7. COMMENTS ENDPOINTS
# ======================================

# GET COMMENTS FOR NOVEL
# GET http://localhost:8080/api/novels/1/comments

# CREATE COMMENT
# POST http://localhost:8080/api/novels/1/comments
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "content": "This is a great novel!"
}

# UPDATE COMMENT
# PUT http://localhost:8080/api/comments/1
# Headers: Authorization: Bearer {token}
# Body (JSON):
{
  "content": "Updated comment text"
}

# DELETE COMMENT
# DELETE http://localhost:8080/api/comments/1
# Headers: Authorization: Bearer {token}


# ======================================
# TESTING SEQUENCE
# ======================================

# 1. Login as admin and get token
#    POST /api/auth/login

# 2. Create a novel (with cover image)
#    POST /api/novels/upload

# 3. Create chapters for that novel (with text content)
#    POST /api/novels/1/chapters

# 4. Get chapters to verify content
#    GET /api/novels/1/chapters

# 5. Add novel to library (as logged-in user)
#    POST /api/users/1/library?novelId=1

# 6. Create review
#    POST /api/novels/1/reviews (with rating 1-5)

# 7. Add reading progress (bookmark)
#    PUT /api/users/1/reading-progress?novelId=1

# 8. Get reading progress to verify bookmark saved
#    GET /api/users/1/reading-progress?novelId=1

DROP DATABASE IF EXISTS novelly_web;
CREATE DATABASE novelly_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novelly_web;

-- ROLES (changed ENUM to VARCHAR to support uppercase)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- NOVELS
CREATE TABLE novels (
    novel_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(120) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    uploaded_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_novel_uploader FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- CHAPTERS
CREATE TABLE chapters (
    chapter_id INT AUTO_INCREMENT PRIMARY KEY,
    novel_id INT NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(255),
    content LONGTEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chapter_novel FOREIGN KEY (novel_id) REFERENCES novels(novel_id) ON DELETE CASCADE
);
CREATE INDEX idx_chapter_novel_number ON chapters(novel_id, chapter_number);

-- REVIEWS (with comment column included)
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    novel_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_novel FOREIGN KEY (novel_id) REFERENCES novels(novel_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_novel_review UNIQUE (user_id, novel_id)
);
CREATE INDEX idx_review_novel ON reviews(novel_id);

-- LIBRARY
CREATE TABLE library (
    library_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    novel_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_library_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_library_novel FOREIGN KEY (novel_id) REFERENCES novels(novel_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_novel_library UNIQUE (user_id, novel_id)
);
CREATE INDEX idx_library_user ON library(user_id);

-- READING_PROGRESS
CREATE TABLE reading_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    novel_id INT NOT NULL,
    chapter_id INT NOT NULL,
    scroll_position INT DEFAULT 0,
    reading_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_novel FOREIGN KEY (novel_id) REFERENCES novels(novel_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_novel_progress UNIQUE (user_id, novel_id)
);
CREATE INDEX idx_progress_user ON reading_progress(user_id);
CREATE INDEX idx_progress_last_read ON reading_progress(user_id, last_read_at);

-- COMMENTS
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    novel_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_novel FOREIGN KEY (novel_id) REFERENCES novels(novel_id) ON DELETE CASCADE
);

-- Insert default roles with UPPERCASE
INSERT INTO roles (role_name) VALUES ('ADMIN'), ('USER');

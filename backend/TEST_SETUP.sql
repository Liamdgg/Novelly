-- =====================================================
-- TESTING SETUP - Admin User & Role Management
-- =====================================================

-- 1. INSERT ADMIN USER with password "admin123"
-- BCrypt hash for "admin123" (generated with Spring Security)
INSERT INTO users (user_id, role_id, username, email, password_hash, created_at) 
VALUES (1, 1, 'admin', 'admin@novelly.com', '$2a$10$slYQmyNdGzin7olVN3p5POPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash = '$2a$10$slYQmyNdGzin7olVN3p5POPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm';

-- 2. INSERT TEST USER 
INSERT INTO users (role_id, username, email, password_hash, created_at) 
VALUES (2, 'testuser', 'test@novelly.com', '$2a$10$slYQmyNdGzin7olVN3p5POPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash = '$2a$10$slYQmyNdGzin7olVN3p5POPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm';

-- =====================================================
-- CHANGE USER ROLE - Examples
-- =====================================================

-- Promote a user to admin (change role_id to 1)
-- UPDATE users SET role_id = 1 WHERE username = 'testuser';

-- Demote an admin to regular user (change role_id to 2)
-- UPDATE users SET role_id = 2 WHERE username = 'admin';

-- Check current users and their roles
SELECT u.user_id, u.username, u.email, r.role_name, u.created_at
FROM users u
JOIN roles r ON u.role_id = r.role_id
ORDER BY u.user_id;

-- =====================================================
-- PASSWORD: admin123 (for both admin and testuser)
-- =====================================================

package com.novelly.backend.controller;

import com.novelly.backend.entity.Chapter;
import com.novelly.backend.entity.Novel;
import com.novelly.backend.entity.ReadingProgress;
import com.novelly.backend.entity.User;
import com.novelly.backend.repository.ChapterRepository;
import com.novelly.backend.repository.NovelRepository;
import com.novelly.backend.repository.ReadingProgressRepository;
import com.novelly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users/{userId}/progress")
public class ReadingProgressController {
    
    @Autowired
    private ReadingProgressRepository progressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NovelRepository novelRepository;
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    /**
     * Get all reading progress for a user
     */
    @GetMapping
    public ResponseEntity<?> getAllProgress(
            @PathVariable Integer userId,
            Authentication authentication) {
        
        try {
            if (!isAuthorized(userId, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only view your own reading progress");
            }
            
            List<ReadingProgress> progressList = progressRepository.findByUserUserIdOrderByLastReadAtDesc(userId);
            return ResponseEntity.ok(progressList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching reading progress: " + e.getMessage());
        }
    }
    
    /**
     * Get reading progress for a specific novel
     */
    @GetMapping("/{novelId}")
    public ResponseEntity<?> getProgressByNovel(
            @PathVariable Integer userId,
            @PathVariable Integer novelId,
            Authentication authentication) {
        
        try {
            if (!isAuthorized(userId, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only view your own reading progress");
            }
            
            Optional<ReadingProgress> progress = progressRepository.findByUserUserIdAndNovelNovelId(userId, novelId);
            
            if (progress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No reading progress found for this novel");
            }
            
            return ResponseEntity.ok(progress.get());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching reading progress: " + e.getMessage());
        }
    }
    
    /**
     * Save or update reading progress
     */
    @PostMapping
    public ResponseEntity<?> saveProgress(
            @PathVariable Integer userId,
            @RequestBody Map<String, Object> progressData,
            Authentication authentication) {
        
        try {
            if (!isAuthorized(userId, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only save your own reading progress");
            }
            
            // Extract data from request
            Integer novelId = (Integer) progressData.get("novelId");
            Integer chapterId = (Integer) progressData.get("chapterId");
            
            if (novelId == null || chapterId == null) {
                return ResponseEntity.badRequest()
                        .body("novelId and chapterId are required");
            }
            
            // Verify entities exist
            Optional<User> user = userRepository.findById(userId);
            Optional<Novel> novel = novelRepository.findById(novelId);
            Optional<Chapter> chapter = chapterRepository.findById(chapterId);
            
            if (user.isEmpty() || novel.isEmpty() || chapter.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User, novel, or chapter not found");
            }
            
            // Find existing progress or create new
            Optional<ReadingProgress> existingProgress = 
                    progressRepository.findByUserUserIdAndNovelNovelId(userId, novelId);
            
            ReadingProgress progress;
            if (existingProgress.isPresent()) {
                progress = existingProgress.get();
            } else {
                progress = new ReadingProgress();
                progress.setUser(user.get());
                progress.setNovel(novel.get());
            }
            
            // Update progress
            progress.setChapter(chapter.get());
            
            progressRepository.save(progress);
            
            return ResponseEntity.ok(progress);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving reading progress: " + e.getMessage());
        }
    }
    
    /**
     * Delete reading progress for a novel
     */
    @DeleteMapping("/{novelId}")
    public ResponseEntity<?> deleteProgress(
            @PathVariable Integer userId,
            @PathVariable Integer novelId,
            Authentication authentication) {
        
        try {
            if (!isAuthorized(userId, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own reading progress");
            }
            
            Optional<ReadingProgress> progress = progressRepository.findByUserUserIdAndNovelNovelId(userId, novelId);
            
            if (progress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No reading progress found");
            }
            
            progressRepository.delete(progress.get());
            return ResponseEntity.ok("Reading progress deleted");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting reading progress: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to check if user is authorized
     */
    private boolean isAuthorized(Integer userId, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> currentUser = userRepository.findByUsername(username);
        return currentUser.isPresent() && currentUser.get().getUserId().equals(userId);
    }
}

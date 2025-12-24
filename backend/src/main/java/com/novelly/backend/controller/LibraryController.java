package com.novelly.backend.controller;

import com.novelly.backend.entity.Library;
import com.novelly.backend.entity.Novel;
import com.novelly.backend.entity.User;
import com.novelly.backend.repository.LibraryRepository;
import com.novelly.backend.repository.NovelRepository;
import com.novelly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users/{userId}/library")
public class LibraryController {
    
    @Autowired
    private LibraryRepository libraryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NovelRepository novelRepository;
    
    /**
     * Add a novel to user's library
     */
    @PostMapping("/{novelId}")
    public ResponseEntity<?> addToLibrary(
            @PathVariable Integer userId,
            @PathVariable Integer novelId,
            Authentication authentication) {
        
        try {
            // Verify the authenticated user matches the userId
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty() || !currentUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only modify your own library");
            }
            
            // Check if novel exists
            Optional<Novel> novel = novelRepository.findById(novelId);
            if (novel.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Novel not found");
            }
            
            // Check if already in library
            if (libraryRepository.existsByUserUserIdAndNovelNovelId(userId, novelId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Novel already in library");
            }
            
            // Add to library
            Library library = new Library();
            library.setUser(currentUser.get());
            library.setNovel(novel.get());
            libraryRepository.save(library);
            
            return ResponseEntity.ok("Novel added to library");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding novel to library: " + e.getMessage());
        }
    }
    
    /**
     * Get all novels in user's library
     */
    @GetMapping
    public ResponseEntity<?> getUserLibrary(
            @PathVariable Integer userId,
            Authentication authentication) {
        
        try {
            // Verify the authenticated user matches the userId
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty() || !currentUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only view your own library");
            }
            
            List<Library> libraryItems = libraryRepository.findByUserUserId(userId);
            return ResponseEntity.ok(libraryItems);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching library: " + e.getMessage());
        }
    }
    
    /**
     * Remove a novel from user's library
     */
    @DeleteMapping("/{novelId}")
    public ResponseEntity<?> removeFromLibrary(
            @PathVariable Integer userId,
            @PathVariable Integer novelId,
            Authentication authentication) {
        
        try {
            // Verify the authenticated user matches the userId
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty() || !currentUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only modify your own library");
            }
            
            // Check if exists in library
            if (!libraryRepository.existsByUserUserIdAndNovelNovelId(userId, novelId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Novel not in library");
            }
            
            libraryRepository.deleteByUserUserIdAndNovelNovelId(userId, novelId);
            return ResponseEntity.ok("Novel removed from library");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing novel from library: " + e.getMessage());
        }
    }
    
    /**
     * Check if a novel is in user's library
     */
    @GetMapping("/{novelId}/check")
    public ResponseEntity<?> checkInLibrary(
            @PathVariable Integer userId,
            @PathVariable Integer novelId,
            Authentication authentication) {
        
        try {
            // Verify the authenticated user matches the userId
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty() || !currentUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only view your own library");
            }
            
            boolean inLibrary = libraryRepository.existsByUserUserIdAndNovelNovelId(userId, novelId);
            return ResponseEntity.ok(new LibraryCheckResponse(inLibrary));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking library: " + e.getMessage());
        }
    }
    
    // Response DTO for library check
    private static class LibraryCheckResponse {
        public boolean inLibrary;
        
        public LibraryCheckResponse(boolean inLibrary) {
            this.inLibrary = inLibrary;
        }
    }
}

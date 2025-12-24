package com.novelly.backend.controller;

import com.novelly.backend.entity.Novel;
import com.novelly.backend.entity.User;
import com.novelly.backend.repository.NovelRepository;
import com.novelly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.UUID;

@RestController
@RequestMapping("/api/novels")
@RequiredArgsConstructor
public class NovelController {
    
    private final NovelRepository novelRepository;
    private final UserRepository userRepository;
    
    private static final String UPLOAD_DIR = "backend/uploads/novels";
    
    @GetMapping
    public ResponseEntity<List<Novel>> getAllNovels(
            @RequestParam(defaultValue = "") String q) {
        List<Novel> novels;
        if (q != null && !q.isEmpty()) {
            novels = novelRepository.searchByKeyword(q);
        } else {
            novels = novelRepository.findAllOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(novels);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Novel> getNovel(@PathVariable Integer id) {
        Optional<Novel> novel = novelRepository.findById(id);
        if (novel.isPresent()) {
            return ResponseEntity.ok(novel.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<Novel> createNovel(@RequestBody Novel novel, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = auth.getName();
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        novel.setUploadedBy(user.get());
        novel.setCreatedAt(LocalDateTime.now());
        novel.setUpdatedAt(LocalDateTime.now());
        
        Novel saved = novelRepository.save(novel);
        return ResponseEntity.ok(saved);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Novel> uploadNovel(
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile coverImage,
            Authentication auth) {
        
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = auth.getName();
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        Novel novel = new Novel();
        novel.setTitle(title);
        novel.setAuthor(author);
        novel.setDescription(description);
        novel.setUploadedBy(user.get());
        novel.setCreatedAt(LocalDateTime.now());
        novel.setUpdatedAt(LocalDateTime.now());
        
        // Save novel first to get the ID
        Novel saved = novelRepository.save(novel);
        System.out.println("Novel saved with ID: " + saved.getNovelId());
        
        // Handle cover image upload with novel ID
        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + coverImage.getOriginalFilename();
                Path novelUploadPath = Paths.get(UPLOAD_DIR, saved.getNovelId().toString(), "cover");
                System.out.println("Creating directory: " + novelUploadPath.toAbsolutePath());
                Files.createDirectories(novelUploadPath);
                System.out.println("Directory created successfully");
                
                Path filePath = novelUploadPath.resolve(filename);
                System.out.println("Writing file to: " + filePath.toAbsolutePath());
                Files.write(filePath, coverImage.getBytes());
                System.out.println("File written successfully");
                
                // Store path for file serving endpoint: /api/pages/file?path=novels/6/cover/filename
                String coverUrl = "novels/" + saved.getNovelId() + "/cover/" + filename;
                System.out.println("Setting cover URL: " + coverUrl);
                saved.setCoverImage(coverUrl);
                saved = novelRepository.save(saved);
                System.out.println("Novel updated with cover image");
            } catch (IOException e) {
                System.err.println("Error uploading file: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        }
        
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Novel> updateNovel(
            @PathVariable Integer id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile coverImage,
            Authentication auth) {
        
        Optional<Novel> existingNovel = novelRepository.findById(id);
        if (existingNovel.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Novel novel = existingNovel.get();
        
        if (title != null) {
            novel.setTitle(title);
        }
        if (author != null) {
            novel.setAuthor(author);
        }
        if (description != null) {
            novel.setDescription(description);
        }
        
        // Handle cover image upload
        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + coverImage.getOriginalFilename();
                Path novelUploadPath = Paths.get(UPLOAD_DIR, novel.getNovelId().toString(), "cover");
                Files.createDirectories(novelUploadPath);
                
                Path filePath = novelUploadPath.resolve(filename);
                Files.write(filePath, coverImage.getBytes());
                
                // Store path for file serving endpoint
                String coverUrl = "novels/" + novel.getNovelId() + "/cover/" + filename;
                novel.setCoverImage(coverUrl);
            } catch (IOException e) {
                System.err.println("Error uploading cover image: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }
        
        novel.setUpdatedAt(LocalDateTime.now());
        Novel updated = novelRepository.save(novel);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNovel(@PathVariable Integer id) {
        if (!novelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Delete associated folder when deleting novel
        try {
            Path novelFolder = Paths.get(UPLOAD_DIR, id.toString());
            if (Files.exists(novelFolder)) {
                deleteDirectoryRecursively(novelFolder);
            }
        } catch (Exception e) {
            System.err.println("Failed to delete novel folder: " + e.getMessage());
            // Continue with database deletion even if folder delete fails
        }
        
        novelRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    // Helper method to delete directory recursively
    private void deleteDirectoryRecursively(Path path) throws IOException {
        Files.walk(path)
            .sorted((a, b) -> b.compareTo(a)) // Sort in reverse to delete files before directories
            .forEach(p -> {
                try {
                    Files.delete(p);
                } catch (IOException e) {
                    System.err.println("Failed to delete: " + p);
                }
            });
    }
}

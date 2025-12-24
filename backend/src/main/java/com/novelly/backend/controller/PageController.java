package com.novelly.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {
    
    private static final String UPLOAD_DIR = "backend/uploads";
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Return empty list for now - can be extended to store page metadata
        Map<String, Object> response = new HashMap<>();
        response.put("content", new ArrayList<>());
        response.put("totalElements", 0);
        response.put("totalPages", 0);
        response.put("currentPage", page);
        response.put("pageSize", size);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Serve files from the uploads directory
     * GET /api/pages/file?path=novels/6/cover/filename.jpg
     */
    @GetMapping("/file")
    public ResponseEntity<byte[]> getFile(@RequestParam String path) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR, path).normalize();
            
            // Security: prevent directory traversal attacks
            Path uploadPath = Paths.get(UPLOAD_DIR).normalize();
            if (!filePath.normalize().startsWith(uploadPath)) {
                return ResponseEntity.badRequest().build();
            }
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileData = Files.readAllBytes(filePath);
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR, "pages");
            Files.createDirectories(uploadPath);
            Files.write(uploadPath.resolve(filename), file.getBytes());
            
            Map<String, String> response = new HashMap<>();
            response.put("filename", filename);
            response.put("filepath", "/api/pages/file?path=pages/" + filename);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/upload-multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleFiles(
            @RequestParam MultipartFile[] files) {
        
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Map<String, String>> uploadedFiles = new ArrayList<>();
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR, "pages");
            Files.createDirectories(uploadPath);
            
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Files.write(uploadPath.resolve(filename), file.getBytes());
                    
                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("filename", filename);
                    fileInfo.put("filepath", "/api/pages/file?path=pages/" + filename);
                    uploadedFiles.add(fileInfo);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("files", uploadedFiles);
            response.put("totalUploaded", uploadedFiles.size());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable Integer pageId) {
        return ResponseEntity.ok().build();

    }
}

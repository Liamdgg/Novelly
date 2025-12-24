package com.novelly.backend.controller;

import com.novelly.backend.entity.Novel;
import com.novelly.backend.entity.Review;
import com.novelly.backend.entity.User;
import com.novelly.backend.repository.NovelRepository;
import com.novelly.backend.repository.ReviewRepository;
import com.novelly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NovelRepository novelRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all reviews for a novel
    @GetMapping("/novel/{novelId}")
    public ResponseEntity<?> getReviewsByNovel(@PathVariable Integer novelId) {
        try {
            List<Review> reviews = reviewRepository.findByNovel_NovelId(novelId);
            
            // Transform to DTO with username
            List<Map<String, Object>> reviewDTOs = reviews.stream().map(review -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("reviewId", review.getReviewId());
                dto.put("rating", review.getRating());
                dto.put("comment", review.getComment());
                dto.put("username", review.getUser().getUsername());
                dto.put("createdAt", review.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(reviewDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching reviews: " + e.getMessage());
        }
    }

    // Get review stats (average rating and count)
    @GetMapping("/novel/{novelId}/stats")
    public ResponseEntity<?> getReviewStats(@PathVariable Integer novelId) {
        try {
            Double avgRating = reviewRepository.getAverageRatingByNovelId(novelId);
            Long count = reviewRepository.getReviewCountByNovelId(novelId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", avgRating != null ? avgRating : 0.0);
            stats.put("reviewCount", count);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching review stats: " + e.getMessage());
        }
    }

    // Create or update review
    @PostMapping("/novel/{novelId}")
    public ResponseEntity<?> createOrUpdateReview(
            @PathVariable Integer novelId,
            @RequestBody Map<String, Object> requestBody,
            Authentication auth) {
        
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        try {
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Novel novel = novelRepository.findById(novelId)
                    .orElseThrow(() -> new RuntimeException("Novel not found"));

            Integer rating = (Integer) requestBody.get("rating");
            String comment = (String) requestBody.get("comment");

            if (rating == null || rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
            }

            // Check if user already reviewed this novel
            Optional<Review> existingReview = reviewRepository.findByUser_UserIdAndNovel_NovelId(
                    user.getUserId(), novelId);

            Review review;
            if (existingReview.isPresent()) {
                // Update existing review
                review = existingReview.get();
                review.setRating(rating);
                review.setComment(comment);
            } else {
                // Create new review
                review = new Review();
                review.setUser(user);
                review.setNovel(novel);
                review.setRating(rating);
                review.setComment(comment);
            }

            review = reviewRepository.save(review);

            // Return DTO
            Map<String, Object> responseDto = new HashMap<>();
            responseDto.put("reviewId", review.getReviewId());
            responseDto.put("rating", review.getRating());
            responseDto.put("comment", review.getComment());
            responseDto.put("username", review.getUser().getUsername());
            responseDto.put("createdAt", review.getCreatedAt());

            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving review: " + e.getMessage());
        }
    }

    // Delete review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer reviewId, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        try {
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            // Check if user owns the review or is admin
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!review.getUser().getUserId().equals(user.getUserId()) && !isAdmin) {
                return ResponseEntity.status(403).body("Not authorized to delete this review");
            }

            reviewRepository.delete(review);
            return ResponseEntity.ok("Review deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting review: " + e.getMessage());
        }
    }
}

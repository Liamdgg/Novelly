package com.novelly.backend.repository;

import com.novelly.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    Optional<Review> findByUser_UserIdAndNovel_NovelId(Integer userId, Integer novelId);
    
    List<Review> findByNovel_NovelId(Integer novelId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.novel.novelId = :novelId")
    Double getAverageRatingByNovelId(Integer novelId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.novel.novelId = :novelId")
    Long getReviewCountByNovelId(Integer novelId);
}

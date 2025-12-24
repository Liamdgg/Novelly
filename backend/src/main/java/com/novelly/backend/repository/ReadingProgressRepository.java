package com.novelly.backend.repository;

import com.novelly.backend.entity.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Integer> {
    
    Optional<ReadingProgress> findByUserUserIdAndNovelNovelId(Integer userId, Integer novelId);
    
    List<ReadingProgress> findByUserUserIdOrderByLastReadAtDesc(Integer userId);
    
    @Query("SELECT rp FROM ReadingProgress rp WHERE rp.user.userId = :userId ORDER BY rp.lastReadAt DESC")
    List<ReadingProgress> findRecentReadingHistory(Integer userId);
}

package com.novelly.backend.repository;

import com.novelly.backend.entity.Novel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NovelRepository extends JpaRepository<Novel, Integer> {
    
    @Query("SELECT n FROM Novel n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(n.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Novel> searchByKeyword(String keyword);
    
    List<Novel> findByUploadedByUserId(Integer userId);
    
    @Query("SELECT n FROM Novel n ORDER BY n.createdAt DESC")
    List<Novel> findAllOrderByCreatedAtDesc();
}

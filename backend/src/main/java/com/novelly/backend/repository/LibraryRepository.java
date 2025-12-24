package com.novelly.backend.repository;

import com.novelly.backend.entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Integer> {
    
    List<Library> findByUserUserId(Integer userId);
    
    Optional<Library> findByUserUserIdAndNovelNovelId(Integer userId, Integer novelId);
    
    boolean existsByUserUserIdAndNovelNovelId(Integer userId, Integer novelId);
    
    @Modifying
    @Transactional
    void deleteByUserUserIdAndNovelNovelId(Integer userId, Integer novelId);
}

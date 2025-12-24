package com.novelly.backend.repository;

import com.novelly.backend.entity.Chapter;
import com.novelly.backend.entity.Novel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    List<Chapter> findByNovelOrderByChapterNumberAsc(Novel novel);
    List<Chapter> findByNovel_NovelIdOrderByChapterNumberAsc(Integer novelId);
    Optional<Chapter> findByNovelAndChapterNumber(Novel novel, Integer chapterNumber);
    Optional<Chapter> findByNovel_NovelIdAndChapterNumber(Integer novelId, Integer chapterNumber);
    boolean existsByNovel_NovelIdAndChapterNumber(Integer novelId, Integer chapterNumber);
    long countByNovel(Novel novel);
}
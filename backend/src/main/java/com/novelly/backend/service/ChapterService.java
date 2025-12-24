package com.novelly.backend.service;

import com.novelly.backend.dto.ChapterDto;
import com.novelly.backend.entity.Chapter;

import java.util.List;

public interface ChapterService {
    
    /**
     * Get all chapters for a specific novel
     */
    List<ChapterDto> getChaptersByNovelId(Integer novelId);
    
    /**
     * Get a specific chapter by novel ID and chapter number
     */
    ChapterDto getChapterByNovelIdAndNumber(Integer novelId, Integer chapterNumber);
    
    /**
     * Get a chapter by its ID
     */
    ChapterDto getChapterById(Integer chapterId);
    
    /**
     * Create a new chapter with text content
     */
    ChapterDto createChapter(Integer novelId, ChapterDto chapterDto);
    
    /**
     * Update an existing chapter
     */
    ChapterDto updateChapter(Integer chapterId, ChapterDto chapterDto);
    
    /**
     * Delete a chapter
     */
    void deleteChapter(Integer chapterId);
}

package com.novelly.backend.controller;

import com.novelly.backend.dto.ChapterDto;
import com.novelly.backend.entity.Chapter;
import com.novelly.backend.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChapterController {

    private final ChapterService chapterService;

    /**
     * Get chapter by ID directly (for reader page)
     * GET /api/chapters/{chapterId}
     */
    @GetMapping("/api/chapters/{chapterId}")
    public ResponseEntity<ChapterDto> getChapterById(@PathVariable Integer chapterId) {
        ChapterDto chapter = chapterService.getChapterById(chapterId);
        return ResponseEntity.ok(chapter);
    }

    /**
     * Get all chapters for a novel
     * GET /api/novels/{novelId}/chapters
     */
    @GetMapping("/api/novels/{novelId}/chapters")
    public ResponseEntity<List<ChapterDto>> getChaptersByNovelId(@PathVariable Integer novelId) {
        List<ChapterDto> chapters = chapterService.getChaptersByNovelId(novelId);
        return ResponseEntity.ok(chapters);
    }

    /**
     * Get a specific chapter with content
     * GET /api/novels/{novelId}/chapters/{chapterNumber}
     */
    @GetMapping("/api/novels/{novelId}/chapters/{chapterNumber}")
    public ResponseEntity<ChapterDto> getChapterByNumber(
            @PathVariable Integer novelId,
            @PathVariable Integer chapterNumber) {
        ChapterDto chapter = chapterService.getChapterByNovelIdAndNumber(novelId, chapterNumber);
        return ResponseEntity.ok(chapter);
    }

    /**
     * Create a new chapter with text content
     * POST /api/novels/{novelId}/chapters
     * Request body: { "chapterNumber": 1, "title": "Chapter Title", "content": "Chapter text..." }
     */
    @PostMapping("/api/novels/{novelId}/chapters")
    public ResponseEntity<ChapterDto> createChapter(
            @PathVariable Integer novelId,
            @RequestBody ChapterDto chapterDto) {
        
        // Validate content
        if (chapterDto.getContent() == null || chapterDto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (chapterDto.getContent().trim().length() < 100) {
            return ResponseEntity.badRequest().build();
        }
        
        ChapterDto createdChapter = chapterService.createChapter(novelId, chapterDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChapter);
    }

    /**
     * Update a chapter
     * PUT /api/novels/{novelId}/chapters/{chapterId}
     */
    @PutMapping("/api/novels/{novelId}/chapters/{chapterId}")
    public ResponseEntity<ChapterDto> updateChapter(
            @PathVariable Integer novelId,
            @PathVariable Integer chapterId,
            @RequestBody ChapterDto chapterDto) {
        ChapterDto updatedChapter = chapterService.updateChapter(chapterId, chapterDto);
        return ResponseEntity.ok(updatedChapter);
    }

    /**
     * Delete a chapter
     * DELETE /api/novels/{novelId}/chapters/{chapterId}
     */
    @DeleteMapping("/api/novels/{novelId}/chapters/{chapterId}")
    public ResponseEntity<Void> deleteChapter(
            @PathVariable Integer novelId,
            @PathVariable Integer chapterId) {
        chapterService.deleteChapter(chapterId);
        return ResponseEntity.noContent().build();
    }
}

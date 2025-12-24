package com.novelly.backend.service.impl;

import com.novelly.backend.dto.ChapterDto;
import com.novelly.backend.entity.Chapter;
import com.novelly.backend.entity.Novel;
import com.novelly.backend.repository.ChapterRepository;
import com.novelly.backend.repository.NovelRepository;
import com.novelly.backend.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final NovelRepository novelRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChapterDto> getChaptersByNovelId(Integer novelId) {
        List<Chapter> chapters = chapterRepository.findByNovel_NovelIdOrderByChapterNumberAsc(novelId);
        return chapters.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterDto getChapterByNovelIdAndNumber(Integer novelId, Integer chapterNumber) {
        Chapter chapter = chapterRepository.findByNovel_NovelIdAndChapterNumber(novelId, chapterNumber)
                .orElseThrow(() -> new RuntimeException("Chapter not found: Novel ID " + novelId + ", Chapter " + chapterNumber));
        return convertToDto(chapter);
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterDto getChapterById(Integer chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found with ID: " + chapterId));
        return convertToDto(chapter);
    }

    @Override
    @Transactional
    public ChapterDto createChapter(Integer novelId, ChapterDto chapterDto) {
        // Find the novel
        Novel novel = novelRepository.findById(novelId)
                .orElseThrow(() -> new RuntimeException("Novel not found with ID: " + novelId));

        // Check if chapter number already exists for this novel
        if (chapterRepository.existsByNovel_NovelIdAndChapterNumber(novelId, chapterDto.getChapterNumber())) {
            throw new RuntimeException("Chapter " + chapterDto.getChapterNumber() + " already exists for this novel");
        }

        // Create new chapter entity
        Chapter chapter = new Chapter();
        chapter.setNovel(novel);
        chapter.setChapterNumber(chapterDto.getChapterNumber());
        chapter.setTitle(chapterDto.getTitle());
        chapter.setContent(chapterDto.getContent());
        chapter.setCreatedAt(LocalDateTime.now());

        // Save chapter
        Chapter savedChapter = chapterRepository.save(chapter);

        return convertToDto(savedChapter);
    }

    @Override
    @Transactional
    public ChapterDto updateChapter(Integer chapterId, ChapterDto chapterDto) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found with ID: " + chapterId));

        // Update fields
        if (chapterDto.getTitle() != null) {
            chapter.setTitle(chapterDto.getTitle());
        }
        if (chapterDto.getContent() != null) {
            chapter.setContent(chapterDto.getContent());
        }
        if (chapterDto.getChapterNumber() != null) {
            // Check if new chapter number conflicts with existing chapters
            if (!chapter.getChapterNumber().equals(chapterDto.getChapterNumber())) {
                if (chapterRepository.existsByNovel_NovelIdAndChapterNumber(
                        chapter.getNovel().getNovelId(), chapterDto.getChapterNumber())) {
                    throw new RuntimeException("Chapter number " + chapterDto.getChapterNumber() + " already exists");
                }
                chapter.setChapterNumber(chapterDto.getChapterNumber());
            }
        }

        Chapter updatedChapter = chapterRepository.save(chapter);
        return convertToDto(updatedChapter);
    }

    @Override
    @Transactional
    public void deleteChapter(Integer chapterId) {
        if (!chapterRepository.existsById(chapterId)) {
            throw new RuntimeException("Chapter not found with ID: " + chapterId);
        }
        chapterRepository.deleteById(chapterId);
    }

    /**
     * Convert Chapter entity to ChapterDto
     */
    private ChapterDto convertToDto(Chapter chapter) {
        ChapterDto dto = new ChapterDto();
        dto.setChapterId(chapter.getChapterId());
        dto.setNovelId(chapter.getNovel().getNovelId());
        dto.setChapterNumber(chapter.getChapterNumber());
        dto.setTitle(chapter.getTitle());
        dto.setContent(chapter.getContent());
        dto.setCreatedAt(chapter.getCreatedAt());
        return dto;
    }
}

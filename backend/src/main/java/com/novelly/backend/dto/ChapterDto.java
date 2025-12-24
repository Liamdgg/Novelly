package com.novelly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDto {

    private Integer chapterId;
    private Integer novelId;
    private Integer chapterNumber;
    private String title;
    private String content;  // Text content of the chapter
    private LocalDateTime createdAt;
}

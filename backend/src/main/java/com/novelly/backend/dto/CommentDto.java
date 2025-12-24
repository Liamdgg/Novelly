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
public class CommentDto {
    private Integer commentId;
    private Integer userId;
    private String username;
    private Integer comicId;
    private String content;
    private LocalDateTime createdAt;
}

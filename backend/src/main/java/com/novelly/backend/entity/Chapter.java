package com.novelly.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chapters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chapter_id")
    private Integer chapterId;
    
    @ManyToOne
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;
    
    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    private String content;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
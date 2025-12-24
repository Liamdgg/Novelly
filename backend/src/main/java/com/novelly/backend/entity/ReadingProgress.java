package com.novelly.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "novel_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Integer progressId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;
    
    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @Column(name = "scroll_position")
    private Integer scrollPosition = 0;
    
    @Column(name = "reading_percentage", precision = 5, scale = 2)
    private BigDecimal readingPercentage = BigDecimal.ZERO;
    
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
    
    @PrePersist
    protected void onCreate() {
        lastReadAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastReadAt = LocalDateTime.now();
    }
}

package com.novelly.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "novels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Novel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "novel_id")
    private Integer novelId;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "author", nullable = false, length = 120)
    private String author;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "cover_image")
    private String coverImage;
    
    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.novelly.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "library",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "novel_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Library {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "library_id")
    private Integer libraryId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;
    
    @Column(name = "added_at")
    private LocalDateTime addedAt;
    
    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}

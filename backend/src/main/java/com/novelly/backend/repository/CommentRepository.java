package com.novelly.backend.repository;

import com.novelly.backend.entity.Comment;
import com.novelly.backend.entity.Novel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByNovelOrderByCreatedAtDesc(Novel novel);
}
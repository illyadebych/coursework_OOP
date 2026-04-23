package com.example.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    // Метод, щоб дістати всі коментарі саме для конкретного предмета
    List<CommentEntity> findByItemIdOrderByCreatedAtDesc(Long itemId);
}
package com.example.backend;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private String authorName;
    private String userId;
    private Long itemId;
    private LocalDateTime createdAt = LocalDateTime.now();

    // ID батьківського коментаря (якщо це відповідь)
    private Long parentId;

    // Зберігаємо ID користувачів, щоб не можна було накручувати
    @ElementCollection
    private Set<String> likedUsers = new HashSet<>();

    @ElementCollection
    private Set<String> dislikedUsers = new HashSet<>();
}
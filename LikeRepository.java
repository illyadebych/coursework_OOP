package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    long countByItemId(Long itemId);
    
    // Нові методи для перевірки та видалення лайка
    boolean existsByUserIdAndItemId(String userId, Long itemId);
    void deleteByUserIdAndItemId(String userId, Long itemId);
}
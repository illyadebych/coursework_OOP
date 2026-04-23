package com.example.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<CollectionEntity, Long> {
    List<CollectionEntity> findByUserId(String userId);
    
    // Метод для пошуку всіх публічних папок
    List<CollectionEntity> findByIsPublicTrue();
}
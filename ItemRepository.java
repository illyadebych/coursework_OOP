package com.example.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUserId(String userId);
    List<Item> findByUserIdAndTitleContainingIgnoreCase(String userId, String title);
    
    // Метод для пошуку предметів за ID папки
    List<Item> findByCollectionId(Long collectionId);
}
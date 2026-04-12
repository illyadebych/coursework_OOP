package com.example.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionRepository extends JpaRepository<CollectionEntity, Long> {
    List<CollectionEntity> findByUserId(String userId);
}
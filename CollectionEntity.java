package com.example.backend;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
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
public class CollectionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;    
    private String userId;      // Тут залишається довгий ID від Firebase
    private String authorName;  // НОВЕ: Тут буде красивий Нікнейм
    
    @Column(columnDefinition = "boolean default false")
    @JsonProperty("isPublic") 
    private boolean isPublic = false; 
}
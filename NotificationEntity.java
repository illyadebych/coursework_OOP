package com.example.backend;

import java.time.LocalDateTime;

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
public class NotificationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; 
    private String message;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // НОВІ ПОЛЯ (Щоб знати, яку модалку і коментар відкривати)
    private Long collectionId;
    private Long commentId; 
}
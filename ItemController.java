package com.example.backend;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired private ItemRepository repository;
    @Autowired private CollectionRepository collectionRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private LikeRepository likeRepository;
    @Autowired private NotificationRepository notificationRepository;

    // --- ПРЕДМЕТИ ---

    @GetMapping("/user/{userId}")
    public List<Item> getItems(@PathVariable String userId, @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return repository.findByUserIdAndTitleContainingIgnoreCase(userId, search);
        }
        return repository.findByUserId(userId);
    }

    @PostMapping
    public Item saveItem(@RequestBody Item item) {
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/get-one/{id}")
    public Item getItem(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @GetMapping("/collection/{collectionId}/items")
    public List<Item> getItemsByCollection(@PathVariable Long collectionId) {
        return repository.findByCollectionId(collectionId);
    }

    // --- ПУБЛІЧНА СТРІЧКА ---

    @GetMapping("/collections/public")
    public List<CollectionEntity> getPublicCollections() {
        return collectionRepository.findByIsPublicTrue();
    }

    // --- КОЛЕКЦІЇ (ПАПКИ) ---

    @GetMapping("/collections/user/{userId}")
    public List<CollectionEntity> getCollections(@PathVariable String userId) {
        return collectionRepository.findByUserId(userId);
    }

    @GetMapping("/collections/{id}")
    public CollectionEntity getCollection(@PathVariable Long id) {
        return collectionRepository.findById(id).orElse(null);
    }

    @PostMapping("/collections")
    public CollectionEntity createCollection(@RequestBody CollectionEntity collection) {
        return collectionRepository.save(collection);
    }

    @PutMapping("/collections/{id}")
    public CollectionEntity updateCollection(@PathVariable Long id, @RequestBody CollectionEntity details) {
        CollectionEntity collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Папку не знайдено"));
        collection.setName(details.getName());
        collection.setPublic(details.isPublic());
        return collectionRepository.save(collection);
    }

    @DeleteMapping("/collections/{id}")
    @org.springframework.transaction.annotation.Transactional
    public void deleteCollection(@PathVariable Long id) {
        // 1. Знаходимо всі предмети в папки
        List<Item> itemsInFolder = repository.findByCollectionId(id);
        
        // 2. Видаляємо всі ці предмети
        repository.deleteAll(itemsInFolder);
        
        // 3. Видаляємо саму папку
        collectionRepository.deleteById(id);
    }

    // --- КОМЕНТАРІ ТА СПОВІЩЕННЯ (ОНОВЛЕНО ДЛЯ ПІДСВІТКИ) ---

    @PostMapping("/comments")
    public CommentEntity addComment(@RequestBody CommentEntity comment) {
        CommentEntity saved = commentRepository.save(comment);
        CollectionEntity coll = collectionRepository.findById(comment.getItemId()).orElse(null);
        
        if (coll != null && !coll.getUserId().equals(comment.getUserId())) {
            // Відрізаємо @gmail.com
            String author = comment.getAuthorName();
            if (author != null && author.contains("@")) {
                author = author.substring(0, author.indexOf("@"));
            }
            
            NotificationEntity notif = new NotificationEntity();
            notif.setUserId(coll.getUserId());
            
            if (comment.getParentId() != null) {
                notif.setMessage(author + " відповів(ла) вам на коментар у колекції: " + coll.getName());
            } else {
                notif.setMessage(author + " прокоментував(ла) вашу колекцію: " + coll.getName());
            }
            
            notif.setCollectionId(coll.getId());
            notif.setCommentId(saved.getId()); // Зберігаємо ID коментаря
            notificationRepository.save(notif);
        }
        return saved;
    }

    @GetMapping("/comments/item/{collectionId}")
    public List<CommentEntity> getComments(@PathVariable Long collectionId) {
        return commentRepository.findByItemIdOrderByCreatedAtDesc(collectionId);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
    }

    // --- РОЗУМНЕ ГОЛОСУВАННЯ ЗА КОМЕНТАР (Лайк/Дізлайк) ---
    @PostMapping("/comments/{id}/vote")
    public CommentEntity voteComment(@PathVariable Long id, @RequestParam String userId, @RequestParam String type) {
        CommentEntity comment = commentRepository.findById(id).orElseThrow();
        
        if ("like".equals(type)) {
            if (comment.getLikedUsers().contains(userId)) {
                comment.getLikedUsers().remove(userId);
            } else {
                comment.getLikedUsers().add(userId);
                comment.getDislikedUsers().remove(userId);
            }
        } else if ("dislike".equals(type)) {
            if (comment.getDislikedUsers().contains(userId)) {
                comment.getDislikedUsers().remove(userId);
            } else {
                comment.getDislikedUsers().add(userId);
                comment.getLikedUsers().remove(userId);
            }
        }
        return commentRepository.save(comment);
    }

   // --- ЛАЙКИ КОЛЕКЦІЇ ---
    @PostMapping("/like/toggle")
    @org.springframework.transaction.annotation.Transactional
    public boolean toggleLike(@RequestBody LikeEntity like) {
        boolean alreadyLiked = likeRepository.existsByUserIdAndItemId(like.getUserId(), like.getItemId());
        
        if (alreadyLiked) {
            likeRepository.deleteByUserIdAndItemId(like.getUserId(), like.getItemId());
            return false; 
        } else {
            likeRepository.save(like);
            CollectionEntity coll = collectionRepository.findById(like.getItemId()).orElse(null);
            
            // Якщо лайкаєш НЕ свою колекцію - надсилаємо сповіщення
            if (coll != null && !coll.getUserId().equals(like.getUserId())) {
                
                // Отримуємо ім'я та відрізаємо пошту
                String author = like.getUserName();
                if (author == null || author.isEmpty()) {
                    author = "Користувач";
                } else if (author.contains("@")) {
                    author = author.substring(0, author.indexOf("@"));
                }

                NotificationEntity notif = new NotificationEntity();
                notif.setUserId(coll.getUserId());
                notif.setMessage(author + " вподобав(ла) вашу колекцію '" + coll.getName() + "'!");
                notif.setCollectionId(coll.getId()); 
                notificationRepository.save(notif);
            }
            return true;
        }
    }

    @GetMapping("/like/status")
    public boolean checkLikeStatus(@RequestParam String userId, @RequestParam Long itemId) {
        return likeRepository.existsByUserIdAndItemId(userId, itemId);
    }

    @GetMapping("/like-count/{collectionId}")
    public long getLikeCount(@PathVariable Long collectionId) {
        return likeRepository.countByItemId(collectionId);
    }

    // --- СПОВІЩЕННЯ (ДЗВІНОЧОК) ---

    @GetMapping("/notifications/{userId}")
    public List<NotificationEntity> getNotifications(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
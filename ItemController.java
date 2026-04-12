package com.example.backend;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemRepository repository;

    @Autowired
    private CollectionRepository collectionRepository;

    @GetMapping("/user/{userId}")
    public List<Item> getItems(@PathVariable String userId) {
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

    // Методи для колекцій (папок)
    @GetMapping("/collections/user/{userId}")
    public List<CollectionEntity> getCollections(@PathVariable String userId) {
        return collectionRepository.findByUserId(userId);
    }

    @PostMapping("/collections")
    public CollectionEntity createCollection(@RequestBody CollectionEntity collection) {
        return collectionRepository.save(collection);
    }
}
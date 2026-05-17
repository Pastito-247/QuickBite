package com.quickbite.menu_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quickbite.menu_service.service.MenuService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final MenuService menuService;
    
    @GetMapping
    public ResponseEntity<List<String>> getAllCategories() {
        log.info("Getting all categories");
        List<String> categories = menuService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/with-count")
    public ResponseEntity<Map<String, Long>> getCategoriesWithItemCount() {
        log.info("Getting categories with item count");
        Map<String, Long> categoriesWithCount = menuService.getCategoriesWithItemCount();
        return ResponseEntity.ok(categoriesWithCount);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<String>> getPopularCategories() {
        log.info("Getting popular categories");
        List<String> popularCategories = menuService.getPopularCategories();
        return ResponseEntity.ok(popularCategories);
    }
}

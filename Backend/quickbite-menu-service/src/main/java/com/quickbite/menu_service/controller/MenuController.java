package com.quickbite.menu_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.quickbite.menu_service.dto.MenuItemRequest;
import com.quickbite.menu_service.dto.MenuItemResponse;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.service.MenuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MenuController {
    
private final MenuService menuService;

    @GetMapping
    public List<MenuItemResponse> showMenu() {
        return menuService.getAvailableMenu();
    }

    @GetMapping("/{id}")
    public MenuItemResponse getMenuById(@PathVariable Long id) {
        return menuService.getMenuItemById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Devuelve un 201 Created profesional
    public MenuItemResponse addMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return menuService.createMenuItem(request);
    }
}

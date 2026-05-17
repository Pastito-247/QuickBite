package com.quickbite.menu_service.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.quickbite.menu_service.dto.MenuItemResponse;
import com.quickbite.menu_service.dto.UpdateAvailabilityRequest;
import com.quickbite.menu_service.dto.UpdateMenuItemRequest;
import com.quickbite.menu_service.dto.UpdatePriceRequest;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.exception.ResourceNotFoundException;
import com.quickbite.menu_service.service.MenuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/menu")
@RequiredArgsConstructor
@Slf4j
public class AdminMenuController {
    
    private final MenuService menuService;

    @PutMapping("/{id}/price")
    public MenuItemResponse updatePrice(@PathVariable Long id, @Valid @RequestBody UpdatePriceRequest request) {
        log.info("Updating price for menu item {}: {}", id, request.getNewPrice());
        return menuService.updatePrice(id, request.getNewPrice());
    }

    @PatchMapping("/{id}/availability")
    public MenuItemResponse updateAvailability(@PathVariable Long id, @Valid @RequestBody UpdateAvailabilityRequest request) {
        log.info("Updating availability for menu item {}: {}", id, request.getAvailable());
        return menuService.updateAvailability(id, request.getAvailable());
    }

    @PutMapping("/{id}")
    public MenuItemResponse updateMenuItem(@PathVariable Long id, @Valid @RequestBody UpdateMenuItemRequest request) {
        log.info("Updating menu item {}: {}", id, request.getName());
        return menuService.updateMenuItem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenuItem(@PathVariable Long id) {
        log.info("Deleting menu item: {}", id);
        menuService.deleteMenuItem(id);
    }

    @GetMapping("/all")
    public List<MenuItemResponse> getAllMenuItems() {
        return menuService.getAllMenuItems();
    }

    @GetMapping("/category/{category}")
    public List<MenuItemResponse> getMenuItemsByCategory(@PathVariable String category) {
        return menuService.getMenuItemsByCategory(category);
    }

    @GetMapping("/unavailable")
    public List<MenuItemResponse> getUnavailableItems() {
        return menuService.getUnavailableItems();
    }
}

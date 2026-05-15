package com.quickbite.menu_service.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quickbite.menu_service.dto.MenuItemRequest;
import com.quickbite.menu_service.dto.MenuItemResponse;
import com.quickbite.menu_service.dto.UpdateAvailabilityRequest;
import com.quickbite.menu_service.dto.UpdateMenuItemRequest;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.exception.ResourceNotFoundException;
import com.quickbite.menu_service.repository.MenuRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {

private final MenuRepository menuRepository;

    // Obtener menú y transformarlo a DTO
    public List<MenuItemResponse> getAvailableMenu() {
        return menuRepository.findByAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Crear plato desde un DTO
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        item.setAvailable(true); // Por defecto disponible

        MenuItem savedItem = menuRepository.save(item);
        return mapToResponse(savedItem);
    }

    // Ejemplo de buscar por ID y lanzar la excepción
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado con el ID: " + id));
        return mapToResponse(item);
    }

    // Métodos de administración
    
    @Transactional
    public MenuItemResponse updatePrice(Long id, Double newPrice) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado con el ID: " + id));
        
        item.setPrice(newPrice);
        MenuItem savedItem = menuRepository.save(item);
        log.info("Updated price for item {}: {} -> {}", id, item.getPrice(), newPrice);
        
        return mapToResponse(savedItem);
    }

    @Transactional
    public MenuItemResponse updateAvailability(Long id, Boolean available) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado con el ID: " + id));
        
        item.setAvailable(available);
        MenuItem savedItem = menuRepository.save(item);
        log.info("Updated availability for item {}: {}", id, available);
        
        return mapToResponse(savedItem);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, UpdateMenuItemRequest request) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado con el ID: " + id));
        
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        item.setCategory(request.getCategory());
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        
        MenuItem savedItem = menuRepository.save(item);
        log.info("Updated menu item: {}", id);
        
        return mapToResponse(savedItem);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plato no encontrado con el ID: " + id);
        }
        
        menuRepository.deleteById(id);
        log.info("Deleted menu item: {}", id);
    }

    public List<MenuItemResponse> getAllMenuItems() {
        return menuRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getMenuItemsByCategory(String category) {
        return menuRepository.findByCategory(category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getUnavailableItems() {
        return menuRepository.findByAvailableFalse()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Métodos de gestión de categorías
    
    public List<String> getAllCategories() {
        return menuRepository.findAll()
                .stream()
                .map(MenuItem::getCategory)
                .filter(category -> category != null && !category.trim().isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    
    public Map<String, Long> getCategoriesWithItemCount() {
        return menuRepository.findAll()
                .stream()
                .filter(item -> item.getCategory() != null && !item.getCategory().trim().isEmpty())
                .collect(Collectors.groupingBy(
                    MenuItem::getCategory,
                    Collectors.counting()
                ));
    }
    
    public List<String> getPopularCategories() {
        return getCategoriesWithItemCount().entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // Método interno para obtener todos los MenuItem (usado por AvailabilityService)
    public List<MenuItem> getAllMenuItemsInternal() {
        return menuRepository.findAll();
    }

    // Método auxiliar para transformar Entity a DTO
    private MenuItemResponse mapToResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .available(item.isAvailable())
                .build();
    }

}

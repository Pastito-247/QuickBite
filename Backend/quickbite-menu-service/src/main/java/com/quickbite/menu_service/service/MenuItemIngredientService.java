package com.quickbite.menu_service.service;

import com.quickbite.menu_service.dto.IngredientAvailability;
import com.quickbite.menu_service.dto.IngredientConsumption;
import com.quickbite.menu_service.dto.IngredientDetail;
import com.quickbite.menu_service.dto.MenuItemIngredientRequest;
import com.quickbite.menu_service.dto.MenuItemIngredientResponse;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.entity.MenuItemIngredient;
import com.quickbite.menu_service.exception.ResourceNotFoundException;
import com.quickbite.menu_service.integration.InventoryServiceClient;
import com.quickbite.menu_service.repository.MenuItemIngredientRepository;
import com.quickbite.menu_service.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuItemIngredientService {

    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final MenuRepository menuRepository;
    private final InventoryServiceClient inventoryServiceClient;

    /**
     * Agregar un ingrediente a un menu item
     */
    @Transactional
    public MenuItemIngredientResponse addIngredientToMenuItem(Long menuItemId, MenuItemIngredientRequest request) {
        MenuItem menuItem = menuRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item no encontrado con ID: " + menuItemId));

        // Verificar que el ingrediente existe en el inventario
        try {
            inventoryServiceClient.checkAvailability(List.of(request.getIngredientId()));
        } catch (Exception e) {
            log.warn("Ingrediente {} no encontrado en inventario, pero se permite asignar", request.getIngredientId());
        }

        MenuItemIngredient menuItemIngredient = MenuItemIngredient.builder()
                .menuItem(menuItem)
                .ingredientId(request.getIngredientId())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .isOptional(request.getIsOptional() != null ? request.getIsOptional() : false)
                .createdAt(System.currentTimeMillis())
                .updatedAt(System.currentTimeMillis())
                .build();

        MenuItemIngredient saved = menuItemIngredientRepository.save(menuItemIngredient);
        log.info("Ingrediente {} agregado al menu item {} con cantidad {}", 
                request.getIngredientId(), menuItemId, request.getQuantity());

        return mapToResponse(saved);
    }

    /**
     * Obtener todos los ingredientes de un menu item
     */
    public List<MenuItemIngredientResponse> getIngredientsByMenuItem(Long menuItemId) {
        MenuItem menuItem = menuRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item no encontrado con ID: " + menuItemId));

        List<MenuItemIngredient> ingredients = menuItemIngredientRepository.findByMenuItem_Id(menuItemId);

        // Obtener IDs de ingredientes
        List<Long> ingredientIds = ingredients.stream()
                .map(MenuItemIngredient::getIngredientId)
                .collect(Collectors.toList());

        // Obtener detalles de ingredientes desde el servicio de inventario
        final Map<Long, String> ingredientNames = !ingredientIds.isEmpty() ? getIngredientNamesMap(ingredientIds) : Map.of();

        return ingredients.stream()
                .map(mii -> mapToResponse(mii, ingredientNames))
                .collect(Collectors.toList());
    }

    private Map<Long, String> getIngredientNamesMap(List<Long> ingredientIds) {
        try {
            List<IngredientDetail> ingredientDetails = inventoryServiceClient.getIngredientsByIds(ingredientIds);
            return ingredientDetails.stream()
                    .collect(Collectors.toMap(IngredientDetail::getId, IngredientDetail::getName));
        } catch (Exception e) {
            log.warn("Error al obtener nombres de ingredientes: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Eliminar un ingrediente de un menu item
     */
    @Transactional
    public void removeIngredientFromMenuItem(Long menuItemId, Long ingredientId) {
        MenuItem menuItem = menuRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item no encontrado con ID: " + menuItemId));

        MenuItemIngredient menuItemIngredient = menuItemIngredientRepository
                .findByMenuItem_Id(menuItemId).stream()
                .filter(mii -> mii.getIngredientId().equals(ingredientId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ingrediente " + ingredientId + " no encontrado en menu item " + menuItemId));

        menuItemIngredientRepository.delete(menuItemIngredient);
        log.info("Ingrediente {} eliminado del menu item {}", ingredientId, menuItemId);
    }

    /**
     * Actualizar un ingrediente de un menu item
     */
    @Transactional
    public MenuItemIngredientResponse updateIngredientInMenuItem(Long menuItemId, Long ingredientId, MenuItemIngredientRequest request) {
        MenuItem menuItem = menuRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item no encontrado con ID: " + menuItemId));

        MenuItemIngredient menuItemIngredient = menuItemIngredientRepository
                .findByMenuItem_Id(menuItemId).stream()
                .filter(mii -> mii.getIngredientId().equals(ingredientId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ingrediente " + ingredientId + " no encontrado en menu item " + menuItemId));

        menuItemIngredient.setQuantity(request.getQuantity());
        menuItemIngredient.setUnit(request.getUnit());
        menuItemIngredient.setIsOptional(request.getIsOptional() != null ? request.getIsOptional() : false);
        menuItemIngredient.setUpdatedAt(System.currentTimeMillis());

        MenuItemIngredient saved = menuItemIngredientRepository.save(menuItemIngredient);
        log.info("Ingrediente {} actualizado en menu item {}", ingredientId, menuItemId);

        return mapToResponse(saved);
    }

    /**
     * Reemplazar todos los ingredientes de un menu item
     */
    @Transactional
    public List<MenuItemIngredientResponse> replaceIngredientsForMenuItem(Long menuItemId, List<MenuItemIngredientRequest> requests) {
        MenuItem menuItem = menuRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item no encontrado con ID: " + menuItemId));

        // Eliminar ingredientes existentes
        menuItemIngredientRepository.deleteByMenuItem_Id(menuItemId);

        // Agregar nuevos ingredientes
        List<MenuItemIngredient> newIngredients = requests.stream()
                .map(request -> MenuItemIngredient.builder()
                        .menuItem(menuItem)
                        .ingredientId(request.getIngredientId())
                        .quantity(request.getQuantity())
                        .unit(request.getUnit())
                        .isOptional(request.getIsOptional() != null ? request.getIsOptional() : false)
                        .createdAt(System.currentTimeMillis())
                        .updatedAt(System.currentTimeMillis())
                        .build())
                .collect(Collectors.toList());

        List<MenuItemIngredient> saved = menuItemIngredientRepository.saveAll(newIngredients);
        log.info("Reemplazados {} ingredientes para menu item {}", saved.size(), menuItemId);

        return saved.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtener IDs de ingredientes de un menu item (para AvailabilityService)
     */
    public List<Long> getIngredientIdsForMenuItem(Long menuItemId) {
        return menuItemIngredientRepository.findByMenuItem_Id(menuItemId).stream()
                .map(MenuItemIngredient::getIngredientId)
                .collect(Collectors.toList());
    }

    /**
     * Obtener ingredientes con cantidades de un menu item (para descuento de stock)
     */
    public List<MenuItemIngredient> getIngredientsWithQuantities(Long menuItemId) {
        return menuItemIngredientRepository.findByMenuItem_Id(menuItemId);
    }

    /**
     * Consumir ingredientes de un menu item (para cuando se hace un pedido)
     * Llama al servicio de inventario para descontar stock
     */
    @Transactional
    public void consumeIngredientsForMenuItem(Long menuItemId, Integer quantity) {
        List<MenuItemIngredient> ingredients = getIngredientsWithQuantities(menuItemId);
        
        if (ingredients.isEmpty()) {
            log.warn("No ingredients found for menu item: {}", menuItemId);
            return;
        }

        // Crear lista de consumos para enviar al inventario
        List<IngredientConsumption> consumptions = ingredients.stream()
                .map(mii -> IngredientConsumption.builder()
                        .ingredientId(mii.getIngredientId())
                        .quantity(Double.valueOf(mii.getQuantity() * quantity))
                        .unit(mii.getUnit())
                        .build())
                .collect(Collectors.toList());

        // Llamar al servicio de inventario para descontar
        try {
            inventoryServiceClient.consumeIngredients(consumptions);
            log.info("Consumidos {} ingredientes para menu item {} con cantidad {}", 
                    consumptions.size(), menuItemId, quantity);
        } catch (Exception e) {
            log.error("Error al consumir ingredientes para menu item {}: {}", menuItemId, e.getMessage());
            throw new RuntimeException("No se pudo descontar ingredientes del inventario", e);
        }
    }

    /**
     * Validar si hay suficiente stock para un menu item
     */
    public boolean hasSufficientStock(Long menuItemId, Integer quantity) {
        List<MenuItemIngredient> ingredients = getIngredientsWithQuantities(menuItemId);

        if (ingredients.isEmpty()) {
            return true; // Si no tiene ingredientes, se permite
        }

        try {
            List<Long> ingredientIds = ingredients.stream()
                    .map(MenuItemIngredient::getIngredientId)
                    .collect(Collectors.toList());

            List<IngredientAvailability> availabilities = inventoryServiceClient.checkAvailability(ingredientIds);

            // Verificar que todos los ingredientes tengan suficiente stock
            for (MenuItemIngredient mii : ingredients) {
                IngredientAvailability availability = availabilities.stream()
                        .filter(a -> a.getIngredientId().equals(mii.getIngredientId()))
                        .findFirst()
                        .orElse(null);

                if (availability == null || !availability.isAvailable() ||
                    availability.getCurrentStock() < (mii.getQuantity() * quantity)) {
                    log.warn("Ingrediente {} sin suficiente stock para menu item {}",
                            mii.getIngredientId(), menuItemId);
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.error("Error al validar stock para menu item {}: {}", menuItemId, e.getMessage());
            return false;
        }
    }

    /**
     * Eliminar todos los ingredientes de un menu item
     */
    @Transactional
    public void deleteIngredientsByMenuItemId(Long menuItemId) {
        menuItemIngredientRepository.deleteByMenuItem_Id(menuItemId);
        log.info("Eliminados todos los ingredientes del menu item {}", menuItemId);
    }

    private MenuItemIngredientResponse mapToResponse(MenuItemIngredient menuItemIngredient, Map<Long, String> ingredientNames) {
        String ingredientName = ingredientNames.getOrDefault(menuItemIngredient.getIngredientId(),
                "Ingrediente " + menuItemIngredient.getIngredientId());

        return MenuItemIngredientResponse.builder()
                .id(menuItemIngredient.getId())
                .menuItemId(menuItemIngredient.getMenuItem() != null ? menuItemIngredient.getMenuItem().getId() : null)
                .ingredientId(menuItemIngredient.getIngredientId())
                .ingredientName(ingredientName)
                .quantity(menuItemIngredient.getQuantity())
                .unit(menuItemIngredient.getUnit())
                .isOptional(menuItemIngredient.getIsOptional())
                .build();
    }

    private MenuItemIngredientResponse mapToResponse(MenuItemIngredient menuItemIngredient) {
        return mapToResponse(menuItemIngredient, Map.of());
    }

    /**
     * Marcar como no disponibles todos los menu items que usan un ingrediente dado.
     * Llamado desde inventario cuando un ingrediente queda sin stock.
     */
    @Transactional
    public void markMenuItemsUnavailableByIngredient(Long ingredientId) {
        List<MenuItemIngredient> associations = menuItemIngredientRepository.findByIngredientId(ingredientId);
        for (MenuItemIngredient mii : associations) {
            MenuItem menuItem = mii.getMenuItem();
            if (menuItem != null && menuItem.isAvailable()) {
                menuItem.setAvailable(false);
                menuRepository.save(menuItem);
                log.info("Menu item {} marcado como no disponible por ingrediente {} sin stock",
                        menuItem.getId(), ingredientId);
            }
        }
    }

    /**
     * Re-evaluar disponibilidad de menu items que usan un ingrediente dado.
     * Llamado desde inventario cuando un ingrediente vuelve a tener stock.
     */
    @Transactional
    public void markMenuItemsAvailableByIngredient(Long ingredientId) {
        List<MenuItemIngredient> associations = menuItemIngredientRepository.findByIngredientId(ingredientId);
        for (MenuItemIngredient mii : associations) {
            MenuItem menuItem = mii.getMenuItem();
            if (menuItem != null && !menuItem.isAvailable()) {
                menuItem.setAvailable(true);
                menuRepository.save(menuItem);
                log.info("Menu item {} marcado como disponible por ingrediente {} con stock",
                        menuItem.getId(), ingredientId);
            }
        }
    }
}

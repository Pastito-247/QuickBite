package com.quickbite.menu_service.repository;

import com.quickbite.menu_service.entity.MenuItemIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, Long> {

    /**
     * Obtener todos los ingredientes de un menu item
     */
    List<MenuItemIngredient> findByMenuItemId(Long menuItemId);

    /**
     * Obtener todos los ingredientes de un menu item (usando la entidad)
     */
    List<MenuItemIngredient> findByMenuItem_Id(Long menuItemId);

    /**
     * Eliminar todos los ingredientes de un menu item
     */
    void deleteByMenuItemId(Long menuItemId);

    /**
     * Eliminar todos los ingredientes de un menu item (usando la entidad)
     */
    void deleteByMenuItem_Id(Long menuItemId);

    /**
     * Obtener todas las asociaciones para un ingrediente dado
     */
    List<MenuItemIngredient> findByIngredientId(Long ingredientId);
}

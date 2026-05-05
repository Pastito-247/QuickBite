package com.ms_inventario.inv.repository;

import com.ms_inventario.inv.entity.Ingredient;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Ingredient, Long> {
    
    @Query("SELECT i FROM Ingredient i WHERE i.isActive = true ORDER BY i.name")
    List<Ingredient> findAllActiveIngredients();
    
    @Query("SELECT i FROM Ingredient i WHERE i.isActive = true")
    Page<Ingredient> findAllActiveIngredientsPaginated(Pageable pageable);
    
    @Query("SELECT i FROM Ingredient i WHERE i.currentStock <= i.minimumStock AND i.isActive = true")
    List<Ingredient> findCriticalStockIngredients();
    
    @Query("SELECT i FROM Ingredient i WHERE i.currentStock <= i.minimumStock AND i.isActive = true")
    Page<Ingredient> findCriticalStockIngredientsPaginated(Pageable pageable);
    
    @Query("SELECT i FROM Ingredient i WHERE i.currentStock = 0 AND i.isActive = true")
    List<Ingredient> findOutOfStockIngredients();
    
    @Query("SELECT i FROM Ingredient i WHERE i.currentStock = 0 AND i.isActive = true")
    Page<Ingredient> findOutOfStockIngredientsPaginated(Pageable pageable);
    
    @Query("SELECT i FROM Ingredient i WHERE i.name = :name AND i.isActive = true")
    Optional<Ingredient> findByName(String name);
    
    @Modifying
    @Query("UPDATE Ingredient i SET i.currentStock = i.currentStock - :quantity WHERE i.id = :ingredientId AND i.currentStock >= :quantity")
    int deductStock(Long ingredientId, Integer quantity);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Ingredient i WHERE i.id = :ingredientId")
    Optional<Ingredient> findByIdWithLock(Long ingredientId);
}

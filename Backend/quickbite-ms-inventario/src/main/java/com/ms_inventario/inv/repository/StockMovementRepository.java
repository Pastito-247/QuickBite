package com.ms_inventario.inv.repository;

import com.ms_inventario.inv.entity.MovementType;
import com.ms_inventario.inv.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.ingredient.id = :ingredientId ORDER BY sm.createdAt DESC")
    List<StockMovement> findByIngredientIdOrderByCreatedAtDesc(Long ingredientId);
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.ingredient.id = :ingredientId")
    Page<StockMovement> findByIngredientIdOrderByCreatedAtDescPaginated(Long ingredientId, Pageable pageable);
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMovement> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(sm) FROM StockMovement sm WHERE sm.movementType = :movementType AND sm.createdAt BETWEEN :startDate AND :endDate")
    Long countByMovementTypeAndDateRange(MovementType movementType, LocalDateTime startDate, LocalDateTime endDate);
}

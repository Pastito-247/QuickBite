package com.quickbite.kitchen.repository;

import com.quickbite.kitchen.model.KitchenOrder;
import com.quickbite.kitchen.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {
    
    Optional<KitchenOrder> findByOrderNumber(String orderNumber);
    
    List<KitchenOrder> findByStatus(OrderStatus status);
    
    @Query("SELECT o FROM KitchenOrder o WHERE o.status IN :statuses ORDER BY o.createdAt ASC")
    List<KitchenOrder> findByStatusInOrderByCreatedAt(@Param("statuses") List<OrderStatus> statuses);
    
    @Query("SELECT o FROM KitchenOrder o WHERE o.status NOT IN ('ENTREGADO', 'CANCELADO') ORDER BY o.createdAt ASC")
    List<KitchenOrder> findActiveOrdersOrderByCreatedAt();
    
    @Query("SELECT o FROM KitchenOrder o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<KitchenOrder> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM KitchenOrder o WHERE o.status = :status AND o.createdAt >= :since")
    Long countByStatusAndCreatedAtAfter(@Param("status") OrderStatus status, 
                                       @Param("since") LocalDateTime since);
    
    boolean existsByOrderNumber(String orderNumber);
}

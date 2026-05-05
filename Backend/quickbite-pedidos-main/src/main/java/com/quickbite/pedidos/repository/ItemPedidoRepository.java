package com.quickbite.pedidos.repository;

import com.quickbite.pedidos.entity.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
    
    List<ItemPedido> findByPedidoId(Long pedidoId);
    
    List<ItemPedido> findByProductoId(Long productoId);
    
    @Query("SELECT i FROM ItemPedido i JOIN i.pedido p WHERE p.id = :pedidoId")
    List<ItemPedido> findItemsByPedidoId(@Param("pedidoId") Long pedidoId);
    
    @Query("SELECT COUNT(i) FROM ItemPedido i JOIN i.pedido p WHERE p.id = :pedidoId")
    Long countItemsByPedidoId(@Param("pedidoId") Long pedidoId);
    
    @Query("SELECT i.productoId, SUM(i.cantidad) FROM ItemPedido i GROUP BY i.productoId ORDER BY SUM(i.cantidad) DESC")
    List<Object[]> findProductosMasVendidos();
    
    @Query("SELECT i.productoId, SUM(i.precioTotal) FROM ItemPedido i GROUP BY i.productoId ORDER BY SUM(i.precioTotal) DESC")
    List<Object[]> findProductosMasRentables();
}

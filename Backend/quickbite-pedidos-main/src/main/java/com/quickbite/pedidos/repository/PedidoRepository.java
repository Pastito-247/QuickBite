package com.quickbite.pedidos.repository;

import com.quickbite.pedidos.entity.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    
    List<Pedido> findByClienteId(Long clienteId);
    
    Page<Pedido> findByClienteId(Long clienteId, Pageable pageable);
    
    List<Pedido> findByEstado(Pedido.EstadoPedido estado);
    
    Page<Pedido> findByEstado(Pedido.EstadoPedido estado, Pageable pageable);
    
    List<Pedido> findByClienteIdAndEstado(Long clienteId, Pedido.EstadoPedido estado);
    
    @Query("SELECT p FROM Pedido p WHERE p.fechaCreacion BETWEEN :fechaInicio AND :fechaFin")
    List<Pedido> findByFechaCreacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                           @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT p FROM Pedido p WHERE p.fechaCreacion >= :fecha")
    List<Pedido> findByFechaCreacionAfter(@Param("fecha") LocalDateTime fecha);
    
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado = :estado")
    Long countByEstado(@Param("estado") Pedido.EstadoPedido estado);
    
    @Query("SELECT p.estado, COUNT(p) FROM Pedido p WHERE p.fechaCreacion >= :fecha GROUP BY p.estado")
    List<Object[]> countPedidosByEstadoDesdeFecha(@Param("fecha") LocalDateTime fecha);
    
    @Query("SELECT p FROM Pedido p WHERE p.nombreCliente LIKE %:nombre%")
    List<Pedido> findByNombreClienteContaining(@Param("nombre") String nombre);
    
    @Query("SELECT p FROM Pedido p WHERE p.emailCliente = :email")
    List<Pedido> findByEmailCliente(@Param("email") String email);
}

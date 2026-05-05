package com.ms_notificaciones.not.repository;

import com.ms_notificaciones.not.model.Notificacion;
import com.ms_notificaciones.not.model.TipoNotificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    List<Notificacion> findByTipoAndIdRestaurante(TipoNotificacion tipo, Long idRestaurante);
    
    List<Notificacion> findByIdUsuarioDestinoAndLeidaFalseOrderByFechaCreacionDesc(Long idUsuarioDestino);
    
    // Métodos paginados
    Page<Notificacion> findByIdUsuarioDestinoAndLeidaFalse(Long idUsuarioDestino, Pageable pageable);
    
    Page<Notificacion> findByIdRestauranteAndFechaCreacionGreaterThanEqual(Long idRestaurante, 
                                                                            LocalDateTime fechaInicio, 
                                                                            Pageable pageable);
    
    List<Notificacion> findByEnviadaFalseAndFechaCreacionBefore(LocalDateTime fecha);
    
    @Query("SELECT n FROM Notificacion n WHERE n.idRestaurante = :idRestaurante " +
           "AND n.fechaCreacion >= :fechaInicio ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findNotificacionesRecientes(@Param("idRestaurante") Long idRestaurante,
                                                   @Param("fechaInicio") LocalDateTime fechaInicio);
}

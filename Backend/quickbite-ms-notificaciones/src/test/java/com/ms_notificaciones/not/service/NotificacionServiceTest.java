package com.ms_notificaciones.not.service;

import com.ms_notificaciones.not.dto.NotificacionRequest;
import com.ms_notificaciones.not.dto.NotificacionResponse;
import com.ms_notificaciones.not.exception.NotificacionNotFoundException;
import com.ms_notificaciones.not.model.Notificacion;
import com.ms_notificaciones.not.model.TipoNotificacion;
import com.ms_notificaciones.not.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private InventarioNotificacionService inventarioNotificacionService;

    @Mock
    private PedidoNotificacionService pedidoNotificacionService;

    @InjectMocks
    private NotificacionService notificacionService;

    private Notificacion notificacion;
    private NotificacionRequest request;

    @BeforeEach
    void setUp() {
        notificacion = new Notificacion();
        notificacion.setId(1L);
        notificacion.setTipo(TipoNotificacion.INVENTARIO_CRITICO);
        notificacion.setMensaje("⚠️ Inventario crítico: Tomate");
        notificacion.setIdReferencia("ING001");
        notificacion.setIdRestaurante(1L);
        notificacion.setIdUsuarioDestino(45L);
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.now());

        request = new NotificacionRequest();
        request.setTipo(TipoNotificacion.INVENTARIO_CRITICO);
        request.setMensaje("⚠️ Inventario crítico: Tomate");
        request.setIdReferencia("ING001");
        request.setIdRestaurante(1L);
        request.setIdUsuarioDestino(45L);
    }

    @Test
    @DisplayName("Debe crear notificación de inventario crítico")
    void crearNotificacion_InventarioCritico_DebeProcesarCorrectamente() {
        // Given
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(notificacion);
        doNothing().when(inventarioNotificacionService).procesarAlertaInventario(any());

        // When
        NotificacionResponse response = notificacionService.crearNotificacion(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTipo()).isEqualTo(TipoNotificacion.INVENTARIO_CRITICO);
        assertThat(response.getMensaje()).isEqualTo("⚠️ Inventario crítico: Tomate");
        verify(inventarioNotificacionService, times(1)).procesarAlertaInventario(any());
    }

    @Test
    @DisplayName("Debe crear notificación de pedido")
    void crearNotificacion_Pedido_DebeProcesarCorrectamente() {
        // Given
        request.setTipo(TipoNotificacion.PEDIDO_LISTO);
        request.setMensaje("✅ Pedido listo");
        notificacion.setTipo(TipoNotificacion.PEDIDO_LISTO);
        
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(notificacion);
        doNothing().when(pedidoNotificacionService).procesarNotificacionPedido(any());

        // When
        NotificacionResponse response = notificacionService.crearNotificacion(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTipo()).isEqualTo(TipoNotificacion.PEDIDO_LISTO);
        verify(pedidoNotificacionService, times(1)).procesarNotificacionPedido(any());
    }

    @Test
    @DisplayName("Debe retornar notificaciones no leídas paginadas")
    void obtenerNotificacionesNoLeidasPaginadas_DebeRetornarPagina() {
        // Given
        Long idUsuario = 45L;
        Pageable pageable = PageRequest.of(0, 10);
        List<Notificacion> notificaciones = Arrays.asList(notificacion);
        Page<Notificacion> page = new PageImpl<>(notificaciones, pageable, 1);
        
        when(notificacionRepository.findByIdUsuarioDestinoAndLeidaFalse(idUsuario, pageable))
                .thenReturn(page);

        // When
        Page<NotificacionResponse> result = notificacionService
                .obtenerNotificacionesNoLeidasPaginadas(idUsuario, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTipo()).isEqualTo(TipoNotificacion.INVENTARIO_CRITICO);
    }

    @Test
    @DisplayName("Debe marcar notificación como leída")
    void marcarComoLeida_NotificacionExistente_DebeActualizar() {
        // Given
        Long idNotificacion = 1L;
        when(notificacionRepository.findById(idNotificacion)).thenReturn(Optional.of(notificacion));
        when(notificacionRepository.save(any())).thenReturn(notificacion);

        // When
        notificacionService.marcarComoLeida(idNotificacion);

        // Then
        verify(notificacionRepository, times(1)).save(notificacion);
        assertThat(notificacion.getLeida()).isTrue();
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando notificación no existe")
    void marcarComoLeida_NotificacionNoExistente_DebeLanzarExcepcion() {
        // Given
        Long idNotificacion = 999L;
        when(notificacionRepository.findById(idNotificacion)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificacionService.marcarComoLeida(idNotificacion))
                .isInstanceOf(NotificacionNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Debe retornar notificaciones por restaurante paginadas")
    void obtenerNotificacionesPorRestaurantePaginadas_DebeRetornarPagina() {
        // Given
        Long idRestaurante = 1L;
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(7);
        Pageable pageable = PageRequest.of(0, 20);
        List<Notificacion> notificaciones = Arrays.asList(notificacion);
        Page<Notificacion> page = new PageImpl<>(notificaciones, pageable, 1);
        
        when(notificacionRepository.findByIdRestauranteAndFechaCreacionGreaterThanEqual(
                idRestaurante, fechaInicio, pageable)).thenReturn(page);

        // When
        Page<NotificacionResponse> result = notificacionService
                .obtenerNotificacionesPorRestaurantePaginadas(idRestaurante, fechaInicio, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getIdRestaurante()).isEqualTo(idRestaurante);
    }
}

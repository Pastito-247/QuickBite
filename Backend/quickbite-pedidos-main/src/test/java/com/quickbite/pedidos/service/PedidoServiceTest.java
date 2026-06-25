package com.quickbite.pedidos.service;

import com.quickbite.pedidos.dto.DashboardStatsResponse;
import com.quickbite.pedidos.dto.ItemPedidoRequest;
import com.quickbite.pedidos.dto.PedidoRequest;
import com.quickbite.pedidos.dto.PedidoResponse;
import com.quickbite.pedidos.entity.ItemPedido;
import com.quickbite.pedidos.entity.Pedido;
import com.quickbite.pedidos.exception.PedidoNotFoundException;
import com.quickbite.pedidos.exception.PedidoValidationException;
import com.quickbite.pedidos.integration.KitchenServiceClient;
import com.quickbite.pedidos.integration.MenuServiceClient;
import com.quickbite.pedidos.repository.ItemPedidoRepository;
import com.quickbite.pedidos.repository.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort; 

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private ItemPedidoRepository itemPedidoRepository;

    @Mock
    private MenuServiceClient menuServiceClient;

    @Mock
    private KitchenServiceClient kitchenServiceClient;

    @InjectMocks
    private PedidoService pedidoService;

    private Pedido testPedido;
    private PedidoRequest pedidoRequest;
    private ItemPedidoRequest itemPedidoRequest;

    @BeforeEach
    void setUp() {
        ItemPedido itemPedido = ItemPedido.builder()
                .id(1L)
                .productoId(1L)
                .nombreProducto("Burger")
                .cantidad(2)
                .precioUnitario(new BigDecimal("10.99"))
                .build();

        testPedido = Pedido.builder()
                .id(1L)
                .numeroPedido("ORD-001")
                .clienteId(1L)
                .nombreCliente("John Doe")
                .emailCliente("john@example.com")
                .telefonoCliente("1234567890")
                .direccionEntrega("123 Main St")
                .metodoPago(Pedido.MetodoPago.TARJETA_CREDITO)
                .costoEnvio(new BigDecimal("5.99"))
                .estado(Pedido.EstadoPedido.PENDIENTE)
                .fechaCreacion(java.time.LocalDateTime.now())
                .items(new ArrayList<>(List.of(itemPedido)))
                .build();

        itemPedidoRequest = new ItemPedidoRequest();
        itemPedidoRequest.setProductoId(1L);
        itemPedidoRequest.setNombreProducto("Burger");
        itemPedidoRequest.setCantidad(2);
        itemPedidoRequest.setPrecioUnitario(new BigDecimal("10.99"));

        pedidoRequest = new PedidoRequest();
        pedidoRequest.setClienteId(1L);
        pedidoRequest.setNombreCliente("John Doe");
        pedidoRequest.setEmailCliente("john@example.com");
        pedidoRequest.setTelefonoCliente("1234567890");
        pedidoRequest.setDireccionEntrega("123 Main St");
        pedidoRequest.setMetodoPago(Pedido.MetodoPago.TARJETA_CREDITO);
        pedidoRequest.setCostoEnvio(new BigDecimal("5.99"));
        pedidoRequest.setItems(Arrays.asList(itemPedidoRequest));
        pedidoRequest.setRestaurantId(1L);
    }

    @Test
    void shouldCrearPedidoSuccessfully() {
        // Given
        Map<String, Object> stockValidation = new HashMap<>();
        stockValidation.put("hasSufficientStock", true);
        when(menuServiceClient.validateStock(anyLong(), anyInt())).thenReturn(stockValidation);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(testPedido);

        // When
        PedidoResponse result = pedidoService.crearPedido(pedidoRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getNumeroPedido()).isEqualTo("ORD-001");
        verify(menuServiceClient).validateStock(anyLong(), anyInt());
        verify(pedidoRepository).save(any(Pedido.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingOrderWithInsufficientStock() {
        // Given
        Map<String, Object> stockValidation = new HashMap<>();
        stockValidation.put("hasSufficientStock", false);
        when(menuServiceClient.validateStock(anyLong(), anyInt())).thenReturn(stockValidation);

        // When & Then
        assertThatThrownBy(() -> pedidoService.crearPedido(pedidoRequest))
            .isInstanceOf(PedidoValidationException.class)
            .hasMessageContaining("No hay suficiente stock");
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void shouldThrowExceptionWhenStockValidationFails() {
        // Given
        when(menuServiceClient.validateStock(anyLong(), anyInt())).thenThrow(new RuntimeException("Service unavailable"));

        // When & Then
        assertThatThrownBy(() -> pedidoService.crearPedido(pedidoRequest))
            .isInstanceOf(PedidoValidationException.class)
            .hasMessageContaining("No se pudo verificar el stock");
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void shouldObtenerPedidoPorIdSuccessfully() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));

        // When
        PedidoResponse result = pedidoService.obtenerPedidoPorId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getNumeroPedido()).isEqualTo("ORD-001");
        verify(pedidoRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentOrderById() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> pedidoService.obtenerPedidoPorId(1L))
            .isInstanceOf(PedidoNotFoundException.class)
            .hasMessageContaining("Pedido no encontrado con ID: 1");
    }

    @Test
    void shouldObtenerPedidoPorNumeroSuccessfully() {
        // Given
        when(pedidoRepository.findByNumeroPedido("ORD-001")).thenReturn(Optional.of(testPedido));

        // When
        PedidoResponse result = pedidoService.obtenerPedidoPorNumero("ORD-001");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getNumeroPedido()).isEqualTo("ORD-001");
        verify(pedidoRepository).findByNumeroPedido("ORD-001");
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentOrderByNumber() {
        // Given
        when(pedidoRepository.findByNumeroPedido("ORD-001")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> pedidoService.obtenerPedidoPorNumero("ORD-001"))
            .isInstanceOf(PedidoNotFoundException.class)
            .hasMessageContaining("Pedido no encontrado con número: ORD-001");
    }

    @Test
    void shouldObtenerPedidosPorClienteSuccessfully() {
        // Given
        when(pedidoRepository.findByClienteId(1L)).thenReturn(Arrays.asList(testPedido));

        // When
        List<PedidoResponse> result = pedidoService.obtenerPedidosPorCliente(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(pedidoRepository).findByClienteId(1L);
    }

    @Test
    void shouldObtenerPedidosPorEstadoSuccessfully() {
        // Given
        when(pedidoRepository.findByEstado(Pedido.EstadoPedido.PENDIENTE)).thenReturn(Arrays.asList(testPedido));

        // When
        List<PedidoResponse> result = pedidoService.obtenerPedidosPorEstado(Pedido.EstadoPedido.PENDIENTE);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(pedidoRepository).findByEstado(Pedido.EstadoPedido.PENDIENTE);
    }

    @Test
    void shouldObtenerTodosLosPedidosSuccessfully() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Pedido> page = new PageImpl<>(Arrays.asList(testPedido));
        when(pedidoRepository.findAll(pageable)).thenReturn(page);

        // When
        Page<PedidoResponse> result = pedidoService.obtenerTodosLosPedidos(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(pedidoRepository).findAll(pageable);
    }

    @Test
    void shouldActualizarEstadoPedidoSuccessfully() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(testPedido);
        when(menuServiceClient.consumeIngredients(anyLong(), anyInt())).thenReturn(java.util.Map.of("success", "true"));

        // When
        PedidoResponse result = pedidoService.actualizarEstadoPedido(1L, Pedido.EstadoPedido.EN_PREPARACION);

        // Then
        assertThat(result).isNotNull();
        verify(pedidoRepository).findById(1L);
        verify(pedidoRepository).save(any(Pedido.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingStatusForNonExistentOrder() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> pedidoService.actualizarEstadoPedido(1L, Pedido.EstadoPedido.EN_PREPARACION))
            .isInstanceOf(PedidoNotFoundException.class);
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void shouldCancelarPedidoSuccessfully() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(testPedido);
        when(kitchenServiceClient.updateOrderStatus(anyString(), anyString())).thenReturn(java.util.Map.of("success", true));

        // When
        pedidoService.cancelarPedido(1L);

        // Then
        verify(pedidoRepository).findById(1L);
        verify(pedidoRepository).save(any(Pedido.class));
        verify(kitchenServiceClient).updateOrderStatus(anyString(), anyString());
    }

    @Test
    void shouldThrowExceptionWhenCancellingAlreadyDeliveredOrder() {
        // Given
        testPedido.setEstado(Pedido.EstadoPedido.ENTREGADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));

        // When & Then
        assertThatThrownBy(() -> pedidoService.cancelarPedido(1L))
            .isInstanceOf(PedidoValidationException.class)
            .hasMessageContaining("No se puede cancelar un pedido ya entregado");
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void shouldThrowExceptionWhenCancellingAlreadyCancelledOrder() {
        // Given
        testPedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));

        // When & Then
        assertThatThrownBy(() -> pedidoService.cancelarPedido(1L))
            .isInstanceOf(PedidoValidationException.class)
            .hasMessageContaining("No se puede cancelar un pedido ya cancelado");
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void shouldObtenerDashboardStatsSuccessfully() {
        // Given
        when(pedidoRepository.count()).thenReturn(100L);
        when(pedidoRepository.sumTotalVentas()).thenReturn(new BigDecimal("5000.00"));
        when(pedidoRepository.countDistinctClientes()).thenReturn(50L);
        
        Pageable top10 = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        Page<Pedido> page = new PageImpl<>(Arrays.asList(testPedido));
        when(pedidoRepository.findAll(top10)).thenReturn(page);
        
        when(menuServiceClient.getAllRestaurants()).thenReturn(Arrays.asList(
            new HashMap<>(Map.of("id", 1L, "name", "Restaurant 1"))
        ));
        
        when(pedidoRepository.statsByRestaurant()).thenReturn(
            Collections.singletonList(new Object[]{1L, 50L, new BigDecimal("2500.00")})
        );

        // When
        DashboardStatsResponse result = pedidoService.obtenerDashboardStats();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalOrders()).isEqualTo(100L);
        assertThat(result.getTotalRevenue()).isEqualTo(new BigDecimal("5000.00"));
        assertThat(result.getActiveUsers()).isEqualTo(50L);
        verify(pedidoRepository).count();
        verify(pedidoRepository).sumTotalVentas();
        verify(pedidoRepository).countDistinctClientes();
    }

    @Test
    void shouldActualizarNotasRestauranteSuccessfully() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(testPedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(testPedido);

        // When
        PedidoResponse result = pedidoService.actualizarNotasRestaurante(1L, "Notas de prueba");

        // Then
        assertThat(result).isNotNull();
        verify(pedidoRepository).findById(1L);
        verify(pedidoRepository).save(any(Pedido.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNotesForNonExistentOrder() {
        // Given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> pedidoService.actualizarNotasRestaurante(1L, "Notas de prueba"))
            .isInstanceOf(PedidoNotFoundException.class);
        verify(pedidoRepository, never()).save(any(Pedido.class));
    }
}

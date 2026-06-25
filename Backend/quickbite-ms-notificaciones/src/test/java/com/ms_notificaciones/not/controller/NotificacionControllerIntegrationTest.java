package com.ms_notificaciones.not.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ms_notificaciones.not.dto.NotificacionRequest;
import com.ms_notificaciones.not.model.TipoNotificacion;
import com.ms_notificaciones.not.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class NotificacionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @BeforeEach
    void setUp() {
        notificacionRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/notificaciones - Crear notificación con rol ADMIN")
    @WithMockUser(roles = "ADMIN")
    void crearNotificacion_ConRolAdmin_DebeCrearNotificacion() throws Exception {
        // Given
        NotificacionRequest request = new NotificacionRequest();
        request.setTipo(TipoNotificacion.INVENTARIO_CRITICO);
        request.setMensaje("⚠️ Inventario crítico");
        request.setIdRestaurante(1L);
        request.setIdUsuarioDestino(45L);

        // When & Then
        mockMvc.perform(post("/api/notificaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("INVENTARIO_CRITICO"))
                .andExpect(jsonPath("$.mensaje").value("⚠️ Inventario crítico"))
                .andExpect(jsonPath("$.idRestaurante").value(1));
    }

    @Test
    @DisplayName("POST /api/notificaciones - Sin autenticación debe retornar 401")
    void crearNotificacion_SinAutenticacion_DebeRetornar401() throws Exception {
        // Given
        NotificacionRequest request = new NotificacionRequest();
        request.setTipo(TipoNotificacion.PEDIDO_LISTO);
        request.setMensaje("Pedido listo");

        // When & Then
        mockMvc.perform(post("/api/notificaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/notificaciones/inventario-critico - Requiere rol ADMIN o SYSTEM")
    @WithMockUser(roles = "ADMIN")
    void alertaInventarioCritico_ConRolAdmin_DebeCrearAlerta() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/notificaciones/inventario-critico")
                .param("idIngrediente", "ING001")
                .param("idRestaurante", "1")
                .param("nombreIngrediente", "Tomate")
                .param("stockActual", "5")
                .param("stockMinimo", "10"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("INVENTARIO_CRITICO"))
                .andExpect(jsonPath("$.mensaje").value(containsString("Tomate")));
    }

    @Test
    @DisplayName("POST /api/notificaciones/inventario-critico - Con rol CLIENTE debe retornar 403")
    @WithMockUser(roles = "CLIENTE")
    void alertaInventarioCritico_ConRolCliente_DebeRetornar403() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/notificaciones/inventario-critico")
                .param("idIngrediente", "ING001")
                .param("idRestaurante", "1")
                .param("nombreIngrediente", "Tomate")
                .param("stockActual", "5")
                .param("stockMinimo", "10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/notificaciones/usuario/{id}/no-leidas - Retorna paginación")
    @WithMockUser(roles = "CLIENTE")
    void obtenerNotificacionesNoLeidas_DebeRetornarPagina() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/notificaciones/usuario/45/no-leidas")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    @DisplayName("POST /api/notificaciones/pedido/{id}/estado - Notificar estado LISTO (RF-11)")
    @WithMockUser(roles = "COCINA")
    void notificarEstadoPedido_Listo_DebeCrearNotificacion() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/notificaciones/pedido/PED123/estado")
                .param("estado", "LISTO")
                .param("idRestaurante", "1")
                .param("idUsuarioDestino", "45"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("PEDIDO_LISTO"))
                .andExpect(jsonPath("$.mensaje").value(containsString("listo para entrega")));
    }

    @Test
    @DisplayName("POST /api/notificaciones/pedido/{id}/estado - Estado inválido debe retornar 400")
    @WithMockUser(roles = "COCINA")
    void notificarEstadoPedido_EstadoInvalido_DebeRetornar400() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/notificaciones/pedido/PED123/estado")
                .param("estado", "ESTADO_INVALIDO")
                .param("idRestaurante", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Swagger UI debe estar disponible")
    void swaggerUi_DebeEstarDisponible() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().isFound());
    }

    @Test
    @DisplayName("API Docs debe estar disponible")
    void apiDocs_DebeEstarDisponible() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").exists());
    }
}

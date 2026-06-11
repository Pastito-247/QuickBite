package com.quickbite.pedidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long activeUsers;
    private long lowStockItems;
    private List<PedidoResponse> recentOrders;
    private List<RestaurantStats> ordersByRestaurant;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestaurantStats {
        private Long restaurantId;
        private String restaurantName;
        private long orders;
        private BigDecimal revenue;
    }
}

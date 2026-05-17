package com.quickbite.menu_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemResponse {
    
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean available;
}

package com.quickbite.kitchen.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    
    @Column(name = "menu_item_id")
    private Long menuItemId;
    
    @Column(name = "item_name")
    private String itemName;
    
    @Column(name = "quantity")
    private Integer quantity;
}

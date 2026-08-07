package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartResponseDTO {

    private Long id;
    private String partCode;
    private String partName;
    private String description;
    private String category;
    private String manufacturer;
    private Double unitPrice;
    private Integer quantityAvailable;
    private Integer minimumStock;
    private Boolean active;
    private Boolean isLowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

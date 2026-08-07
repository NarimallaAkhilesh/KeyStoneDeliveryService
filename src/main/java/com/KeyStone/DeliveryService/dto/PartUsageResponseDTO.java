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
public class PartUsageResponseDTO {

    private Long id;
    private Long workOrderId;
    private String workOrderNumber;
    private Long partId;
    private String partCode;
    private String partName;
    private Integer quantityUsed;
    private Double unitPrice;
    private Double totalPrice;
    private String remarks;
    private Long usedById;
    private String usedByName;
    private LocalDateTime usedAt;
}

package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsageRequestDTO {

    @NotNull(message = "Part ID is required")
    private Long partId;

    @NotNull(message = "Quantity used is required")
    @Positive(message = "Quantity used must be greater than zero")
    private Integer quantityUsed;

    private String remarks;
}

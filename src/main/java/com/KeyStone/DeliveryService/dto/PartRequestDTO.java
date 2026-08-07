package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class PartRequestDTO {

    @NotBlank(message = "Part name is required")
    private String partName;

    private String description;
    private String category;
    private String manufacturer;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be greater than zero")
    private Double unitPrice;

    @NotNull(message = "Quantity available is required")
    @Min(value = 0, message = "Quantity available cannot be negative")
    private Integer quantityAvailable;

    @NotNull(message = "Minimum stock threshold is required")
    @Min(value = 0, message = "Minimum stock threshold cannot be negative")
    private Integer minimumStock;
}

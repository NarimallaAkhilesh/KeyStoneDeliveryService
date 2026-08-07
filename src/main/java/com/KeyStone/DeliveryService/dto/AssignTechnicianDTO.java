package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTechnicianDTO {

    @NotNull(message = "Work order ID is required")
    private Long workOrderId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}

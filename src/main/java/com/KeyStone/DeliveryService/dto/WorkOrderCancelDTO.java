package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderCancelDTO {

    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;

    private String remarks;
}

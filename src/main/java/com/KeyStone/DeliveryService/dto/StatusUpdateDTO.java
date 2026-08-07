package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateDTO {

    @NotNull(message = "Work order ID is required")
    private Long workOrderId;

    @NotNull(message = "Status is required")
    private WorkOrderStatus status;
}

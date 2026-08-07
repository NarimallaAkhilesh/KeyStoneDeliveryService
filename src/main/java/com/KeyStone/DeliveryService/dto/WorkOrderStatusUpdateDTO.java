package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderStatusUpdateDTO {

    @NotNull(message = "Status is required")
    @JsonAlias("newStatus")
    private WorkOrderStatus status;

    private String remarks;
}

package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import com.KeyStone.DeliveryService.enums.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    // siteId is required for manager/dispatcher; set at service layer for customers
    private Long siteId;

    @NotBlank(message = "Work order title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private LocalDateTime scheduledDate;

    private Long dispatcherId;

    private Long assignedTechnicianId;
}


package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistoryDTO {

    private Long id;
    private Long workOrderId;
    private String workOrderNumber;

    private WorkOrderStatus previousStatus;
    private WorkOrderStatus newStatus;

    private Long updatedById;
    private String updatedByName;
    private String updatedByEmail;

    private String remarks;
    private String holdReason;
    private LocalDateTime expectedResumeDate;
    private String cancellationReason;
    private String resolutionSummary;

    private LocalDateTime timestamp;
}

package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderResponseDTO {

    private Long id;
    private String workOrderNumber;
    private String title;
    private String description;
    private Priority priority;
    private WorkOrderStatus status;

    private Long customerId;
    private String customerName;
    private String customerCode;

    private Long siteId;
    private String siteName;
    private String siteCode;

    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedTechnicianEmail;

    private Long dispatcherId;
    private String dispatcherName;
    private String dispatcherEmail;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ─── Extended fields for frontend detail views ─────────────────────────────
    private LocalDateTime scheduledDate;
    private LocalDateTime completedAt;
    private LocalDateTime assignedAt;
    private String resolutionSummary;
    private String completionRemarks;
    private String holdReason;
    private LocalDateTime expectedResumeDate;
    private String cancellationReason;
}

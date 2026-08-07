package com.KeyStone.DeliveryService.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderTimelineDTO {

    private Long workOrderId;
    private String workOrderNumber;
    private String title;
    private String currentStatus;

    private List<StatusHistoryDTO> history;
    private List<AssignmentResponseDTO> assignmentHistory;
}

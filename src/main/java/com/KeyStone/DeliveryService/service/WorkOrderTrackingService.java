package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.StatusHistoryDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCancelDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCompleteDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderHoldDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderStatusUpdateDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderTimelineDTO;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

public interface WorkOrderTrackingService {

    WorkOrderResponseDTO updateStatus(Long workOrderId, WorkOrderStatusUpdateDTO request, String userEmail);

    WorkOrderResponseDTO completeWorkOrder(Long workOrderId, WorkOrderCompleteDTO request, String userEmail);

    WorkOrderResponseDTO holdWorkOrder(Long workOrderId, WorkOrderHoldDTO request, String userEmail);

    WorkOrderResponseDTO cancelWorkOrder(Long workOrderId, WorkOrderCancelDTO request, String userEmail);

    WorkOrderTimelineDTO getWorkOrderTimeline(Long workOrderId);

    WorkOrderTimelineDTO getWorkOrderTimeline(Long workOrderId, String userEmail);

    List<StatusHistoryDTO> getWorkOrderHistory(Long workOrderId);

    List<StatusHistoryDTO> getWorkOrderHistory(Long workOrderId, String userEmail);

    WorkOrderDashboardDTO getDashboardStatistics();

    List<WorkOrderResponseDTO> searchWorkOrdersAdvanced(
            WorkOrderStatus status,
            Priority priority,
            Long customerId,
            Long siteId,
            Long technicianId,
            String startDateStr,
            String endDateStr);
}

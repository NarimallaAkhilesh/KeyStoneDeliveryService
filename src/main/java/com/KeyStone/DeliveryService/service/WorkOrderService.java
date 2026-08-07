package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.AssignTechnicianDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderRequestDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderUpdateDTO;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

public interface WorkOrderService {

    WorkOrderResponseDTO createWorkOrder(WorkOrderRequestDTO request);

    WorkOrderResponseDTO createWorkOrder(WorkOrderRequestDTO request, String userEmail);

    WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateDTO request);

    WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateDTO request, String userEmail);

    void deleteWorkOrder(Long id);

    WorkOrderResponseDTO activateWorkOrder(Long id);

    WorkOrderResponseDTO restoreWorkOrder(Long id);

    WorkOrderResponseDTO getWorkOrder(Long id);

    WorkOrderResponseDTO getWorkOrder(Long id, String userEmail);

    List<WorkOrderResponseDTO> getAllWorkOrders();

    WorkOrderResponseDTO assignTechnician(AssignTechnicianDTO request);

    WorkOrderResponseDTO startWork(Long id);

    WorkOrderResponseDTO holdWork(Long id);

    WorkOrderResponseDTO resumeWork(Long id);

    WorkOrderResponseDTO completeWork(Long id);

    WorkOrderResponseDTO cancelWorkOrder(Long id);

    List<WorkOrderResponseDTO> getCustomerWorkOrders(Long customerId);

    List<WorkOrderResponseDTO> getCustomerWorkOrders(Long customerId, String userEmail);

    List<WorkOrderResponseDTO> getTechnicianWorkOrders(Long technicianId);

    List<WorkOrderResponseDTO> getWorkOrdersByStatus(WorkOrderStatus status);

    List<WorkOrderResponseDTO> getWorkOrdersByPriority(Priority priority);

    List<WorkOrderResponseDTO> searchWorkOrders(String title);
}

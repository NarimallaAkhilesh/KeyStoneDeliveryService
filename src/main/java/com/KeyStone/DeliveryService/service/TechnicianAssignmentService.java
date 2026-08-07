package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.AssignmentResponseDTO;
import com.KeyStone.DeliveryService.dto.TechnicianDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;

public interface TechnicianAssignmentService {

    AssignmentResponseDTO assignTechnician(Long workOrderId, Long technicianId, String dispatcherEmail);

    AssignmentResponseDTO reassignTechnician(Long workOrderId, Long newTechnicianId, String dispatcherEmail);

    AssignmentResponseDTO removeAssignment(Long workOrderId, String dispatcherEmail);

    AssignmentResponseDTO getAssignment(Long workOrderId);

    List<WorkOrderResponseDTO> getTechnicianWorkOrders(Long technicianId, String filter);

    TechnicianDashboardDTO getTechnicianDashboard(Long technicianId);
}

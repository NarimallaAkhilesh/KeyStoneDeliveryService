package com.KeyStone.DeliveryService.service.impl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.AssignmentResponseDTO;
import com.KeyStone.DeliveryService.dto.TechnicianDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.entity.TechnicianAssignment;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.repository.TechnicianAssignmentRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.TechnicianAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TechnicianAssignmentServiceImpl implements TechnicianAssignmentService {

    private final WorkOrderRepository workOrderRepository;
    private final UserAuthRepository userAuthRepository;
    private final TechnicianAssignmentRepository assignmentRepository;

    @Override
    public AssignmentResponseDTO assignTechnician(Long workOrderId, Long technicianId, String dispatcherEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        validateWorkOrderStatusForAssignment(workOrder);

        UserAuth technician = userAuthRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician user not found with id: " + technicianId));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("User with id " + technicianId + " does not have TECHNICIAN role");
        }

        UserAuth assignedBy = getAssignedByUser(dispatcherEmail);

        workOrder.setAssignedTechnician(technician);
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        workOrder.setAssignedAt(LocalDateTime.now());
        workOrderRepository.save(workOrder);

        TechnicianAssignment assignment = TechnicianAssignment.builder()
                .workOrder(workOrder)
                .previousTechnician(null)
                .newTechnician(technician)
                .assignedBy(assignedBy)
                .actionType("ASSIGNED")
                .build();
        assignmentRepository.save(assignment);

        return mapToAssignmentResponseDTO(assignment, workOrder);
    }

    @Override
    public AssignmentResponseDTO reassignTechnician(Long workOrderId, Long newTechnicianId, String dispatcherEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        validateWorkOrderStatusForAssignment(workOrder);

        UserAuth newTechnician = userAuthRepository.findById(newTechnicianId)
                .orElseThrow(() -> new RuntimeException("New Technician user not found with id: " + newTechnicianId));

        if (newTechnician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("User with id " + newTechnicianId + " does not have TECHNICIAN role");
        }

        UserAuth previousTechnician = workOrder.getAssignedTechnician();
        UserAuth assignedBy = getAssignedByUser(dispatcherEmail);

        workOrder.setAssignedTechnician(newTechnician);
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        workOrder.setAssignedAt(LocalDateTime.now());
        workOrderRepository.save(workOrder);

        TechnicianAssignment assignment = TechnicianAssignment.builder()
                .workOrder(workOrder)
                .previousTechnician(previousTechnician)
                .newTechnician(newTechnician)
                .assignedBy(assignedBy)
                .actionType("REASSIGNED")
                .build();
        assignmentRepository.save(assignment);

        return mapToAssignmentResponseDTO(assignment, workOrder);
    }

    @Override
    public AssignmentResponseDTO removeAssignment(Long workOrderId, String dispatcherEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        validateWorkOrderStatusForAssignment(workOrder);

        UserAuth previousTechnician = workOrder.getAssignedTechnician();
        UserAuth assignedBy = getAssignedByUser(dispatcherEmail);

        workOrder.setAssignedTechnician(null);
        workOrder.setStatus(WorkOrderStatus.NEW);
        workOrder.setAssignedAt(null);
        workOrderRepository.save(workOrder);

        TechnicianAssignment assignment = TechnicianAssignment.builder()
                .workOrder(workOrder)
                .previousTechnician(previousTechnician)
                .newTechnician(null)
                .assignedBy(assignedBy)
                .actionType("REMOVED")
                .build();
        assignmentRepository.save(assignment);

        return mapToAssignmentResponseDTO(assignment, workOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponseDTO getAssignment(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        TechnicianAssignment latestAssignment = assignmentRepository.findTopByWorkOrderIdOrderByAssignedAtDesc(workOrderId);

        if (latestAssignment != null) {
            return mapToAssignmentResponseDTO(latestAssignment, workOrder);
        }

        UserAuth tech = workOrder.getAssignedTechnician();
        return AssignmentResponseDTO.builder()
                .workOrderId(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .workOrderTitle(workOrder.getTitle())
                .technicianId(tech != null ? tech.getId() : null)
                .technicianName(tech != null ? tech.getUserName() : null)
                .technicianEmail(tech != null ? tech.getUserEmail() : null)
                .actionType(tech != null ? "ASSIGNED" : "NONE")
                .assignedAt(workOrder.getAssignedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getTechnicianWorkOrders(Long technicianId, String filter) {
        if (!userAuthRepository.existsById(technicianId)) {
            throw new RuntimeException("Technician user not found with id: " + technicianId);
        }

        List<WorkOrder> workOrders;

        if (filter == null || filter.trim().isEmpty()) {
            workOrders = workOrderRepository.findByAssignedTechnicianId(technicianId);
        } else {
            String cleanFilter = filter.trim().toUpperCase();
            switch (cleanFilter) {
                case "OPEN":
                    workOrders = workOrderRepository.findByAssignedTechnicianIdAndStatusIn(
                            technicianId, Arrays.asList(WorkOrderStatus.NEW, WorkOrderStatus.ASSIGNED));
                    break;
                case "IN_PROGRESS":
                    workOrders = workOrderRepository.findByAssignedTechnicianIdAndStatusIn(
                            technicianId, Arrays.asList(WorkOrderStatus.STARTED, WorkOrderStatus.ON_HOLD, WorkOrderStatus.RESUMED));
                    break;
                case "COMPLETED":
                    workOrders = workOrderRepository.findByAssignedTechnicianIdAndStatus(
                            technicianId, WorkOrderStatus.COMPLETED);
                    break;
                default:
                    workOrders = workOrderRepository.findByAssignedTechnicianId(technicianId);
                    break;
            }
        }

        return workOrders.stream().map(this::mapToWorkOrderDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianDashboardDTO getTechnicianDashboard(Long technicianId) {
        UserAuth technician = userAuthRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician user not found with id: " + technicianId));

        long total = workOrderRepository.countByAssignedTechnicianId(technicianId);
        long pending = workOrderRepository.countByAssignedTechnicianIdAndStatusIn(
                technicianId, Arrays.asList(WorkOrderStatus.NEW, WorkOrderStatus.ASSIGNED));
        long inProgress = workOrderRepository.countByAssignedTechnicianIdAndStatusIn(
                technicianId, Arrays.asList(WorkOrderStatus.STARTED, WorkOrderStatus.ON_HOLD, WorkOrderStatus.RESUMED));
        long completed = workOrderRepository.countByAssignedTechnicianIdAndStatus(technicianId, WorkOrderStatus.COMPLETED);
        long cancelled = workOrderRepository.countByAssignedTechnicianIdAndStatus(technicianId, WorkOrderStatus.CANCELLED);

        return TechnicianDashboardDTO.builder()
                .technicianId(technician.getId())
                .technicianName(technician.getUserName())
                .technicianEmail(technician.getUserEmail())
                .totalAssigned(total)
                .pending(pending)
                .inProgress(inProgress)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }

    private WorkOrder getActiveWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        if (!Boolean.TRUE.equals(workOrder.getActive())) {
            throw new RuntimeException("Work Order ID " + workOrderId + " is inactive");
        }

        return workOrder;
    }

    private void validateWorkOrderStatusForAssignment(WorkOrder workOrder) {
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot modify assignment for a Work Order with status " + workOrder.getStatus());
        }
    }

    private UserAuth getAssignedByUser(String email) {
        if (email != null && !email.trim().isEmpty()) {
            return userAuthRepository.findByUserEmail(email).orElse(null);
        }
        return null;
    }

    private AssignmentResponseDTO mapToAssignmentResponseDTO(TechnicianAssignment assignment, WorkOrder workOrder) {
        AssignmentResponseDTO.AssignmentResponseDTOBuilder builder = AssignmentResponseDTO.builder()
                .workOrderId(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .workOrderTitle(workOrder.getTitle())
                .actionType(assignment.getActionType())
                .assignedAt(assignment.getAssignedAt());

        if (assignment.getNewTechnician() != null) {
            builder.technicianId(assignment.getNewTechnician().getId())
                   .technicianName(assignment.getNewTechnician().getUserName())
                   .technicianEmail(assignment.getNewTechnician().getUserEmail());
        }

        if (assignment.getPreviousTechnician() != null) {
            builder.previousTechnicianId(assignment.getPreviousTechnician().getId())
                   .previousTechnicianName(assignment.getPreviousTechnician().getUserName());
        }

        if (assignment.getAssignedBy() != null) {
            builder.assignedById(assignment.getAssignedBy().getId())
                   .assignedByName(assignment.getAssignedBy().getUserName());
        }

        return builder.build();
    }

    private WorkOrderResponseDTO mapToWorkOrderDTO(WorkOrder workOrder) {
        WorkOrderResponseDTO.WorkOrderResponseDTOBuilder builder = WorkOrderResponseDTO.builder()
                .id(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .title(workOrder.getTitle())
                .description(workOrder.getDescription())
                .priority(workOrder.getPriority())
                .status(workOrder.getStatus())
                .active(workOrder.getActive())
                .createdAt(workOrder.getCreatedAt())
                .updatedAt(workOrder.getUpdatedAt());

        if (workOrder.getCustomer() != null) {
            builder.customerId(workOrder.getCustomer().getId())
                   .customerName(workOrder.getCustomer().getCustomerName())
                   .customerCode(workOrder.getCustomer().getCustomerCode());
        }

        if (workOrder.getSite() != null) {
            builder.siteId(workOrder.getSite().getId())
                   .siteName(workOrder.getSite().getSiteName())
                   .siteCode(workOrder.getSite().getSiteCode());
        }

        if (workOrder.getAssignedTechnician() != null) {
            builder.assignedTechnicianId(workOrder.getAssignedTechnician().getId())
                   .assignedTechnicianName(workOrder.getAssignedTechnician().getUserName())
                   .assignedTechnicianEmail(workOrder.getAssignedTechnician().getUserEmail());
        }

        if (workOrder.getDispatcher() != null) {
            builder.dispatcherId(workOrder.getDispatcher().getId())
                   .dispatcherName(workOrder.getDispatcher().getUserName())
                   .dispatcherEmail(workOrder.getDispatcher().getUserEmail());
        }

        return builder.build();
    }
}

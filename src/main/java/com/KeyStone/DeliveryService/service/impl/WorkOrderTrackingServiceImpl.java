package com.KeyStone.DeliveryService.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.AssignmentResponseDTO;
import com.KeyStone.DeliveryService.dto.StatusHistoryDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCancelDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCompleteDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderHoldDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderStatusUpdateDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderTimelineDTO;
import com.KeyStone.DeliveryService.entity.TechnicianAssignment;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.entity.WorkOrderStatusHistory;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.exception.CustomerNotFoundException;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.TechnicianAssignmentRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderStatusHistoryRepository;
import com.KeyStone.DeliveryService.service.WorkOrderTrackingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkOrderTrackingServiceImpl implements WorkOrderTrackingService {

    private final WorkOrderRepository workOrderRepository;
    private final UserAuthRepository userAuthRepository;
    private final CustomerRepository customerRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final TechnicianAssignmentRepository assignmentRepository;

    @Override
    public WorkOrderResponseDTO updateStatus(Long workOrderId, WorkOrderStatusUpdateDTO request, String userEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        UserAuth user = getUserByEmail(userEmail);

        validateTechnicianOwnershipIfTechnician(workOrder, user);

        WorkOrderStatus prevStatus = workOrder.getStatus();
        workOrder.setStatus(request.getStatus());

        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(savedWorkOrder)
                .previousStatus(prevStatus)
                .newStatus(request.getStatus())
                .updatedBy(user)
                .remarks(request.getRemarks())
                .build();
        historyRepository.save(history);

        return mapToWorkOrderResponseDTO(savedWorkOrder);
    }

    @Override
    public WorkOrderResponseDTO completeWorkOrder(Long workOrderId, WorkOrderCompleteDTO request, String userEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        UserAuth user = getUserByEmail(userEmail);

        validateTechnicianOwnershipIfTechnician(workOrder, user);

        WorkOrderStatus prevStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        workOrder.setCompletedAt(LocalDateTime.now());
        workOrder.setResolutionSummary(request.getResolutionSummary());
        workOrder.setCompletionRemarks(request.getRemarks());

        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(savedWorkOrder)
                .previousStatus(prevStatus)
                .newStatus(WorkOrderStatus.COMPLETED)
                .updatedBy(user)
                .remarks(request.getRemarks())
                .resolutionSummary(request.getResolutionSummary())
                .build();
        historyRepository.save(history);

        return mapToWorkOrderResponseDTO(savedWorkOrder);
    }

    @Override
    public WorkOrderResponseDTO holdWorkOrder(Long workOrderId, WorkOrderHoldDTO request, String userEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        UserAuth user = getUserByEmail(userEmail);

        validateTechnicianOwnershipIfTechnician(workOrder, user);

        WorkOrderStatus prevStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.ON_HOLD);
        workOrder.setHoldReason(request.getHoldReason());
        workOrder.setExpectedResumeDate(request.getExpectedResumeDate());

        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(savedWorkOrder)
                .previousStatus(prevStatus)
                .newStatus(WorkOrderStatus.ON_HOLD)
                .updatedBy(user)
                .remarks(request.getRemarks())
                .holdReason(request.getHoldReason())
                .expectedResumeDate(request.getExpectedResumeDate())
                .build();
        historyRepository.save(history);

        return mapToWorkOrderResponseDTO(savedWorkOrder);
    }

    @Override
    public WorkOrderResponseDTO cancelWorkOrder(Long workOrderId, WorkOrderCancelDTO request, String userEmail) {
        WorkOrder workOrder = getActiveWorkOrder(workOrderId);
        UserAuth user = getUserByEmail(userEmail);

        if (user != null && user.getRole() == Role.CUSTOMER) {
            Customer callerCustomer = customerRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
            if (!workOrder.getCustomer().getId().equals(callerCustomer.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this work order");
            }
            if (workOrder.getStatus() != WorkOrderStatus.NEW && workOrder.getStatus() != WorkOrderStatus.ASSIGNED) {
                throw new RuntimeException("Work Order cannot be cancelled after work has started");
            }
        }

        WorkOrderStatus prevStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.CANCELLED);
        workOrder.setCancellationReason(request.getCancellationReason());

        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(savedWorkOrder)
                .previousStatus(prevStatus)
                .newStatus(WorkOrderStatus.CANCELLED)
                .updatedBy(user)
                .remarks(request.getRemarks())
                .cancellationReason(request.getCancellationReason())
                .build();
        historyRepository.save(history);

        return mapToWorkOrderResponseDTO(savedWorkOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderTimelineDTO getWorkOrderTimeline(Long workOrderId) {
        return getWorkOrderTimeline(workOrderId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderTimelineDTO getWorkOrderTimeline(Long workOrderId, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        if (userEmail != null) {
            UserAuth user = getUserByEmail(userEmail);
            if (user != null && user.getRole() == Role.CUSTOMER) {
                Customer callerCustomer = customerRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
                if (!workOrder.getCustomer().getId().equals(callerCustomer.getId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this work order");
                }
            }
        }

        List<StatusHistoryDTO> historyList = historyRepository.findByWorkOrderIdOrderByTimestampAsc(workOrderId).stream()
                .map(this::mapToStatusHistoryDTO)
                .collect(Collectors.toList());

        List<AssignmentResponseDTO> assignmentList = assignmentRepository.findByWorkOrderId(workOrderId).stream()
                .map(this::mapToAssignmentResponseDTO)
                .collect(Collectors.toList());

        return WorkOrderTimelineDTO.builder()
                .workOrderId(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .title(workOrder.getTitle())
                .currentStatus(workOrder.getStatus().name())
                .history(historyList)
                .assignmentHistory(assignmentList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getWorkOrderHistory(Long workOrderId) {
        return getWorkOrderHistory(workOrderId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getWorkOrderHistory(Long workOrderId, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        if (userEmail != null) {
            UserAuth user = getUserByEmail(userEmail);
            if (user != null && user.getRole() == Role.CUSTOMER) {
                Customer callerCustomer = customerRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
                if (!workOrder.getCustomer().getId().equals(callerCustomer.getId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this work order");
                }
            }
        }

        return historyRepository.findByWorkOrderIdOrderByTimestampDesc(workOrderId).stream()
                .map(this::mapToStatusHistoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderDashboardDTO getDashboardStatistics() {
        long total = workOrderRepository.count();
        long open = workOrderRepository.countByStatus(WorkOrderStatus.NEW);
        long assigned = workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED);
        long inProgress = workOrderRepository.countByStatusIn(
                Arrays.asList(WorkOrderStatus.STARTED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.RESUMED));
        long onHold = workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD);
        long completed = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);
        long cancelled = workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayCompleted = workOrderRepository.countByStatusAndCompletedAtBetween(WorkOrderStatus.COMPLETED, startOfDay, endOfDay);

        return WorkOrderDashboardDTO.builder()
                .totalWorkOrders(total)
                .open(open)
                .assigned(assigned)
                .inProgress(inProgress)
                .onHold(onHold)
                .completed(completed)
                .cancelled(cancelled)
                .todayCompleted(todayCompleted)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> searchWorkOrdersAdvanced(
            WorkOrderStatus status,
            Priority priority,
            Long customerId,
            Long siteId,
            Long technicianId,
            String startDateStr,
            String endDateStr) {

        LocalDateTime startDate = parseDateTime(startDateStr, true);
        LocalDateTime endDate = parseDateTime(endDateStr, false);

        return workOrderRepository.searchWorkOrdersAdvanced(status, priority, customerId, siteId, technicianId, startDate, endDate).stream()
                .map(this::mapToWorkOrderResponseDTO)
                .collect(Collectors.toList());
    }

    private WorkOrder getActiveWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        if (!Boolean.TRUE.equals(workOrder.getActive())) {
            throw new RuntimeException("Work Order ID " + workOrderId + " is inactive");
        }

        return workOrder;
    }

    private UserAuth getUserByEmail(String email) {
        if (email != null && !email.trim().isEmpty()) {
            return userAuthRepository.findByUserEmail(email).orElse(null);
        }
        return null;
    }

    private void validateTechnicianOwnershipIfTechnician(WorkOrder workOrder, UserAuth user) {
        if (user != null && user.getRole() == Role.TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null || !workOrder.getAssignedTechnician().getId().equals(user.getId())) {
                throw new RuntimeException("Access Denied: Technicians can only update their own assigned work orders");
            }
        }
    }

    private LocalDateTime parseDateTime(String dateStr, boolean isStart) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(dateStr.trim());
            return isStart ? date.atStartOfDay() : date.atTime(LocalTime.MAX);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr.trim());
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private StatusHistoryDTO mapToStatusHistoryDTO(WorkOrderStatusHistory history) {
        StatusHistoryDTO.StatusHistoryDTOBuilder builder = StatusHistoryDTO.builder()
                .id(history.getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .remarks(history.getRemarks())
                .holdReason(history.getHoldReason())
                .expectedResumeDate(history.getExpectedResumeDate())
                .cancellationReason(history.getCancellationReason())
                .resolutionSummary(history.getResolutionSummary())
                .timestamp(history.getTimestamp());

        if (history.getWorkOrder() != null) {
            builder.workOrderId(history.getWorkOrder().getId())
                   .workOrderNumber(history.getWorkOrder().getWorkOrderNumber());
        }

        if (history.getUpdatedBy() != null) {
            builder.updatedById(history.getUpdatedBy().getId())
                   .updatedByName(history.getUpdatedBy().getUserName())
                   .updatedByEmail(history.getUpdatedBy().getUserEmail());
        }

        return builder.build();
    }

    private AssignmentResponseDTO mapToAssignmentResponseDTO(TechnicianAssignment assignment) {
        AssignmentResponseDTO.AssignmentResponseDTOBuilder builder = AssignmentResponseDTO.builder()
                .actionType(assignment.getActionType())
                .assignedAt(assignment.getAssignedAt());

        if (assignment.getWorkOrder() != null) {
            builder.workOrderId(assignment.getWorkOrder().getId())
                   .workOrderNumber(assignment.getWorkOrder().getWorkOrderNumber())
                   .workOrderTitle(assignment.getWorkOrder().getTitle());
        }

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

    private WorkOrderResponseDTO mapToWorkOrderResponseDTO(WorkOrder workOrder) {
        WorkOrderResponseDTO.WorkOrderResponseDTOBuilder builder = WorkOrderResponseDTO.builder()
                .id(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .title(workOrder.getTitle())
                .description(workOrder.getDescription())
                .priority(workOrder.getPriority())
                .status(workOrder.getStatus())
                .active(workOrder.getActive())
                .createdAt(workOrder.getCreatedAt())
                .updatedAt(workOrder.getUpdatedAt())
                .scheduledDate(workOrder.getAssignedAt())
                .completedAt(workOrder.getCompletedAt())
                .assignedAt(workOrder.getAssignedAt())
                .resolutionSummary(workOrder.getResolutionSummary())
                .completionRemarks(workOrder.getCompletionRemarks())
                .holdReason(workOrder.getHoldReason())
                .expectedResumeDate(workOrder.getExpectedResumeDate())
                .cancellationReason(workOrder.getCancellationReason());

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

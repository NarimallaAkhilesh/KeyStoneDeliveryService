package com.KeyStone.DeliveryService.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.AssignTechnicianDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderRequestDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderUpdateDTO;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.entity.Site;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.exception.CustomerNotFoundException;
import com.KeyStone.DeliveryService.exception.SiteNotFoundException;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.entity.TechnicianAssignment;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.SiteRepository;
import com.KeyStone.DeliveryService.repository.TechnicianAssignmentRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.SLAService;
import com.KeyStone.DeliveryService.service.WorkOrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkOrderServiceImpl implements WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserAuthRepository userAuthRepository;
    private final TechnicianAssignmentRepository assignmentRepository;
    private final SLAService slaService;

    @Override
    public WorkOrderResponseDTO createWorkOrder(WorkOrderRequestDTO request) {
        return createWorkOrder(request, null);
    }

    @Override
    public WorkOrderResponseDTO createWorkOrder(WorkOrderRequestDTO request, String userEmail) {
        if (userEmail != null) {
            Optional<UserAuth> callerOpt = userAuthRepository.findByUserEmail(userEmail);
            if (callerOpt.isPresent() && callerOpt.get().getRole() == Role.CUSTOMER) {
                Customer callerCustomer = customerRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for user email: " + userEmail));
                request.setCustomerId(callerCustomer.getId());
                request.setDispatcherId(null);
                request.setAssignedTechnicianId(null);
            }
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(
                        () -> new CustomerNotFoundException("Customer not found with id: " + request.getCustomerId()));

        Site site = null;
        if (request.getSiteId() != null) {
            site = siteRepository.findById(request.getSiteId())
                    .orElseThrow(() -> new SiteNotFoundException("Site not found with id: " + request.getSiteId()));
            if (!site.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException(
                        "Site ID " + request.getSiteId() + " does not belong to Customer ID " + request.getCustomerId());
            }
        }

        UserAuth dispatcher = null;
        if (request.getDispatcherId() != null) {
            dispatcher = userAuthRepository.findById(request.getDispatcherId())
                    .orElseThrow(() -> new RuntimeException(
                            "Dispatcher user not found with id: " + request.getDispatcherId()));
            if (dispatcher.getRole() != Role.DISPATCHER && dispatcher.getRole() != Role.MANAGER) {
                throw new RuntimeException(
                        "User with id " + request.getDispatcherId() + " does not have DISPATCHER or MANAGER role");
            }
        }

        UserAuth technician = null;
        WorkOrderStatus initialStatus = WorkOrderStatus.NEW;
        if (request.getAssignedTechnicianId() != null) {
            technician = userAuthRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException(
                            "Technician user not found with id: " + request.getAssignedTechnicianId()));
            if (technician.getRole() != Role.TECHNICIAN) {
                throw new RuntimeException("Assigned user must have TECHNICIAN role");
            }
            initialStatus = WorkOrderStatus.ASSIGNED;
        }

        String workOrderNumber = generateWorkOrderNumber();

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderNumber(workOrderNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(initialStatus)
                .customer(customer)
                .site(site)
                .dispatcher(dispatcher)
                .assignedTechnician(technician)
                .assignedAt(request.getScheduledDate())
                .active(true)
                .build();

        WorkOrder savedWorkOrder = workOrderRepository.save(workOrder);
        slaService.initializeSLAForWorkOrder(savedWorkOrder);
        return mapToDTO(savedWorkOrder);
    }

    @Override
    public WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateDTO request) {
        return updateWorkOrder(id, request, null);
    }

    @Override
    public WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateDTO request, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        UserAuth caller = null;
        if (userEmail != null) {
            Optional<UserAuth> callerOpt = userAuthRepository.findByUserEmail(userEmail);
            if (callerOpt.isPresent()) {
                caller = callerOpt.get();
                if (caller.getRole() == Role.CUSTOMER) {
                    Customer callerCustomer = customerRepository.findByEmail(userEmail)
                            .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
                    if (!workOrder.getCustomer().getId().equals(callerCustomer.getId())) {
                        throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this work order");
                    }
                    if (workOrder.getStatus() != WorkOrderStatus.NEW) {
                        throw new RuntimeException("Work Order cannot be edited after assignment or start of work");
                    }
                }
            }
        }

        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setPriority(request.getPriority());

        if (request.getTechnicianId() != null) {
            UserAuth newTechnician = userAuthRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician user not found with id: " + request.getTechnicianId()));
            if (newTechnician.getRole() != Role.TECHNICIAN) {
                throw new RuntimeException("Assigned user must have TECHNICIAN role");
            }

            UserAuth previousTechnician = workOrder.getAssignedTechnician();
            if (previousTechnician == null || !previousTechnician.getId().equals(newTechnician.getId())) {
                workOrder.setAssignedTechnician(newTechnician);
                workOrder.setStatus(WorkOrderStatus.ASSIGNED);
                if (workOrder.getAssignedAt() == null) {
                    workOrder.setAssignedAt(java.time.LocalDateTime.now());
                }

                if (caller != null && (caller.getRole() == Role.DISPATCHER || caller.getRole() == Role.MANAGER)) {
                    workOrder.setDispatcher(caller);
                }

                TechnicianAssignment assignment = TechnicianAssignment.builder()
                        .workOrder(workOrder)
                        .previousTechnician(previousTechnician)
                        .newTechnician(newTechnician)
                        .assignedBy(caller)
                        .actionType(previousTechnician == null ? "ASSIGNED" : "REASSIGNED")
                        .build();
                assignmentRepository.save(assignment);
            }
        }

        WorkOrder updatedWorkOrder = workOrderRepository.saveAndFlush(workOrder);
        return mapToDTO(updatedWorkOrder);
    }

    @Override
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setActive(false);
        workOrderRepository.save(workOrder);
    }

    @Override
    public WorkOrderResponseDTO activateWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setActive(true);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO restoreWorkOrder(Long id) {
        return activateWorkOrder(id);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderResponseDTO getWorkOrder(Long id) {
        return getWorkOrder(id, null);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderResponseDTO getWorkOrder(Long id, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        if (userEmail != null) {
            Optional<UserAuth> callerOpt = userAuthRepository.findByUserEmail(userEmail);
            if (callerOpt.isPresent() && callerOpt.get().getRole() == Role.CUSTOMER) {
                Customer callerCustomer = customerRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
                if (!workOrder.getCustomer().getId().equals(callerCustomer.getId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access Denied: You can only view your own work orders");
                }
            }
        }
        return mapToDTO(workOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getAllWorkOrders() {
        return workOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WorkOrderResponseDTO assignTechnician(AssignTechnicianDTO request) {
        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new WorkOrderNotFoundException(
                        "Work Order not found with id: " + request.getWorkOrderId()));

        UserAuth technician = userAuthRepository.findById(request.getTechnicianId())
                .orElseThrow(
                        () -> new RuntimeException("Technician user not found with id: " + request.getTechnicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("Assigned user must have TECHNICIAN role");
        }

        workOrder.setAssignedTechnician(technician);
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);

        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO startWork(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setStatus(WorkOrderStatus.STARTED);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO holdWork(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setStatus(WorkOrderStatus.ON_HOLD);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO resumeWork(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setStatus(WorkOrderStatus.RESUMED);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO completeWork(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    public WorkOrderResponseDTO cancelWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + id));

        workOrder.setStatus(WorkOrderStatus.CANCELLED);
        return mapToDTO(workOrderRepository.save(workOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getCustomerWorkOrders(Long customerId) {
        return getCustomerWorkOrders(customerId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getCustomerWorkOrders(Long customerId, String userEmail) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }

        if (userEmail != null) {
            Optional<UserAuth> callerOpt = userAuthRepository.findByUserEmail(userEmail);
            if (callerOpt.isPresent() && callerOpt.get().getRole() == Role.CUSTOMER) {
                Customer callerCustomer = customerRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + userEmail));
                if (!callerCustomer.getId().equals(customerId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access Denied: You can only access your own customer records");
                }
            }
        }

        return workOrderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getTechnicianWorkOrders(Long technicianId) {
        if (!userAuthRepository.existsById(technicianId)) {
            throw new RuntimeException("Technician user not found with id: " + technicianId);
        }
        return workOrderRepository.findByAssignedTechnicianId(technicianId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getWorkOrdersByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getWorkOrdersByPriority(Priority priority) {
        return workOrderRepository.findByPriority(priority).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> searchWorkOrders(String title) {
        return workOrderRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private synchronized String generateWorkOrderNumber() {
        Optional<WorkOrder> latestWorkOrder = workOrderRepository.findTopByOrderByIdDesc();
        long nextId = latestWorkOrder.map(w -> w.getId() + 1).orElse(1L);
        return String.format("WO%04d", 1000 + nextId);
    }

    private WorkOrderResponseDTO mapToDTO(WorkOrder workOrder) {
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

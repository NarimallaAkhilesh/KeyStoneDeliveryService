package com.KeyStone.DeliveryService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    Optional<WorkOrder> findByWorkOrderNumber(String workOrderNumber);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByCustomerId(Long customerId);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findBySiteId(Long siteId);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByAssignedTechnicianId(Long technicianId);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByAssignedTechnicianIdAndStatus(Long technicianId, WorkOrderStatus status);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByAssignedTechnicianIdAndStatusIn(Long technicianId, List<WorkOrderStatus> statuses);

    long countByAssignedTechnicianId(Long technicianId);

    long countByAssignedTechnicianIdAndStatus(Long technicianId, WorkOrderStatus status);

    long countByAssignedTechnicianIdAndStatusIn(Long technicianId, List<WorkOrderStatus> statuses);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByDispatcherId(Long dispatcherId);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByStatus(WorkOrderStatus status);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByPriority(Priority priority);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByTitleContainingIgnoreCase(String title);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByActiveTrue();

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByActiveFalse();

    long countByActiveTrue();

    long countByActiveFalse();

    long countByStatus(WorkOrderStatus status);

    long countByStatusIn(List<WorkOrderStatus> statuses);

    long countByStatusAndCompletedAtBetween(WorkOrderStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT w FROM WorkOrder w WHERE " +
            "(:status IS NULL OR w.status = :status) AND " +
            "(:priority IS NULL OR w.priority = :priority) AND " +
            "(:customerId IS NULL OR w.customer.id = :customerId) AND " +
            "(:siteId IS NULL OR w.site.id = :siteId) AND " +
            "(:technicianId IS NULL OR w.assignedTechnician.id = :technicianId) AND " +
            "(cast(:startDate as java.time.LocalDateTime) IS NULL OR w.createdAt >= :startDate) AND " +
            "(cast(:endDate as java.time.LocalDateTime) IS NULL OR w.createdAt <= :endDate)")
    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> searchWorkOrdersAdvanced(
            @org.springframework.data.repository.query.Param("status") WorkOrderStatus status,
            @org.springframework.data.repository.query.Param("priority") Priority priority,
            @org.springframework.data.repository.query.Param("customerId") Long customerId,
            @org.springframework.data.repository.query.Param("siteId") Long siteId,
            @org.springframework.data.repository.query.Param("technicianId") Long technicianId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @Override
    @EntityGraph(attributePaths = {"customer", "site", "assignedTechnician", "dispatcher"})
    List<WorkOrder> findAll();

    Optional<WorkOrder> findTopByOrderByIdDesc();
}

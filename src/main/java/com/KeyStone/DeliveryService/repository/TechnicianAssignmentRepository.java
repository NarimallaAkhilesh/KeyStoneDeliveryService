package com.KeyStone.DeliveryService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.TechnicianAssignment;

@Repository
public interface TechnicianAssignmentRepository extends JpaRepository<TechnicianAssignment, Long> {

    @EntityGraph(attributePaths = {"workOrder", "previousTechnician", "newTechnician", "assignedBy"})
    List<TechnicianAssignment> findByWorkOrderId(Long workOrderId);

    @EntityGraph(attributePaths = {"workOrder", "previousTechnician", "newTechnician", "assignedBy"})
    List<TechnicianAssignment> findByNewTechnicianId(Long technicianId);

    // Get the latest assignment record for a work order
    TechnicianAssignment findTopByWorkOrderIdOrderByAssignedAtDesc(Long workOrderId);
}

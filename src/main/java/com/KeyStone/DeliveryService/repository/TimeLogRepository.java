package com.KeyStone.DeliveryService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.TimeLog;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    @EntityGraph(attributePaths = {"workOrder", "technician"})
    List<TimeLog> findByWorkOrderId(Long workOrderId);

    @EntityGraph(attributePaths = {"workOrder", "technician"})
    List<TimeLog> findByTechnicianId(Long technicianId);

    @EntityGraph(attributePaths = {"workOrder", "technician"})
    Optional<TimeLog> findByTechnicianIdAndStatus(Long technicianId, String status);

    @EntityGraph(attributePaths = {"workOrder", "technician"})
    Optional<TimeLog> findByWorkOrderIdAndTechnicianIdAndStatusIn(Long workOrderId, Long technicianId, List<String> statuses);
}

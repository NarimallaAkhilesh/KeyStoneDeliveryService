package com.KeyStone.DeliveryService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.WorkOrderStatusHistory;

@Repository
public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {

    @EntityGraph(attributePaths = {"workOrder", "updatedBy"})
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByTimestampAsc(Long workOrderId);

    @EntityGraph(attributePaths = {"workOrder", "updatedBy"})
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByTimestampDesc(Long workOrderId);
}

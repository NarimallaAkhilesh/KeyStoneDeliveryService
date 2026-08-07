package com.KeyStone.DeliveryService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.PartUsage;

@Repository
public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {

    @EntityGraph(attributePaths = {"workOrder", "part", "usedBy"})
    List<PartUsage> findByWorkOrderId(Long workOrderId);

    @EntityGraph(attributePaths = {"workOrder", "part", "usedBy"})
    List<PartUsage> findByUsedById(Long usedById);
}

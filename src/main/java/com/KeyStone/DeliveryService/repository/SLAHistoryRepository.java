package com.KeyStone.DeliveryService.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.SLAHistory;

@Repository
public interface SLAHistoryRepository extends JpaRepository<SLAHistory, Long> {

    @EntityGraph(attributePaths = {"workOrder", "slaConfiguration"})
    Optional<SLAHistory> findByWorkOrderId(Long workOrderId);

    @EntityGraph(attributePaths = {"workOrder", "slaConfiguration"})
    List<SLAHistory> findByResponseBreachedTrueOrResolutionBreachedTrue();

    @Query("SELECT s FROM SLAHistory s JOIN FETCH s.workOrder WHERE " +
           "(s.responseBreached = false AND s.firstResponseAt IS NULL AND s.responseDeadline <= :now) OR " +
           "(s.resolutionBreached = false AND s.completedAt IS NULL AND s.resolutionDeadline <= :now)")
    List<SLAHistory> findBreachedSLAs(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM SLAHistory s JOIN FETCH s.workOrder WHERE " +
           "(s.responseBreached = false AND s.firstResponseAt IS NULL AND s.responseDeadline BETWEEN :now AND :threshold) OR " +
           "(s.resolutionBreached = false AND s.completedAt IS NULL AND s.resolutionDeadline BETWEEN :now AND :threshold)")
    List<SLAHistory> findUpcomingDeadlines(@Param("now") LocalDateTime now, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT COUNT(s) FROM SLAHistory s WHERE s.createdAt >= :startOfDay AND s.createdAt <= :endOfDay AND " +
           "(s.responseBreached = true OR s.resolutionBreached = true)")
    long countTodayBreaches(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}

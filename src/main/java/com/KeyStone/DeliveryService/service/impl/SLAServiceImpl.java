package com.KeyStone.DeliveryService.service.impl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.SLAConfigurationDTO;
import com.KeyStone.DeliveryService.dto.SLADashboardDTO;
import com.KeyStone.DeliveryService.dto.SLAHistoryDTO;
import com.KeyStone.DeliveryService.entity.SLAConfiguration;
import com.KeyStone.DeliveryService.entity.SLAHistory;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.exception.SLANotFoundException;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.repository.SLAConfigurationRepository;
import com.KeyStone.DeliveryService.repository.SLAHistoryRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.SLAService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SLAServiceImpl implements SLAService {

    private final SLAConfigurationRepository configRepository;
    private final SLAHistoryRepository historyRepository;
    private final WorkOrderRepository workOrderRepository;

    @Override
    public SLAHistoryDTO initializeSLAForWorkOrder(WorkOrder workOrder) {
        Priority priority = workOrder.getPriority() != null ? workOrder.getPriority() : Priority.MEDIUM;

        SLAConfiguration config = configRepository.findByPriority(priority)
                .orElseGet(() -> getDefaultConfigForPriority(priority));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime responseDeadline = now.plusHours(config.getResponseTimeHours());
        LocalDateTime resolutionDeadline = now.plusHours(config.getResolutionTimeHours());

        SLAHistory history = SLAHistory.builder()
                .workOrder(workOrder)
                .slaConfiguration(config)
                .responseDeadline(responseDeadline)
                .resolutionDeadline(resolutionDeadline)
                .responseBreached(false)
                .resolutionBreached(false)
                .build();

        SLAHistory saved = historyRepository.save(history);
        return mapToDTO(saved);
    }

    @Override
    public void recordFirstResponse(Long workOrderId) {
        historyRepository.findByWorkOrderId(workOrderId).ifPresent(history -> {
            if (history.getFirstResponseAt() == null) {
                LocalDateTime now = LocalDateTime.now();
                history.setFirstResponseAt(now);
                if (now.isAfter(history.getResponseDeadline())) {
                    history.setResponseBreached(true);
                    history.setBreachReason("Response time exceeded deadline of " + history.getResponseDeadline());
                }
                historyRepository.save(history);
            }
        });
    }

    @Override
    public void recordCompletion(Long workOrderId) {
        historyRepository.findByWorkOrderId(workOrderId).ifPresent(history -> {
            if (history.getCompletedAt() == null) {
                LocalDateTime now = LocalDateTime.now();
                history.setCompletedAt(now);
                if (now.isAfter(history.getResolutionDeadline())) {
                    history.setResolutionBreached(true);
                    history.setBreachReason("Resolution time exceeded deadline of " + history.getResolutionDeadline());
                }
                historyRepository.save(history);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public SLAHistoryDTO getSLAForWorkOrder(Long workOrderId) {
        SLAHistory history = historyRepository.findByWorkOrderId(workOrderId)
                .orElseThrow(() -> new SLANotFoundException("SLA record not found for Work Order ID: " + workOrderId));
        return mapToDTO(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SLAHistoryDTO> getBreachedSLAs() {
        return historyRepository.findByResponseBreachedTrueOrResolutionBreachedTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SLAHistoryDTO> getUpcomingDeadlines() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusHours(2);
        return historyRepository.findUpcomingDeadlines(now, threshold).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SLADashboardDTO getSLADashboard() {
        long totalBreaches = historyRepository.findByResponseBreachedTrueOrResolutionBreachedTrue().size();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayBreaches = historyRepository.countTodayBreaches(startOfDay, endOfDay);

        LocalDateTime now = LocalDateTime.now();
        long overdue = historyRepository.findBreachedSLAs(now).size();
        long upcoming = historyRepository.findUpcomingDeadlines(now, now.plusHours(2)).size();

        List<SLAHistory> allHistories = historyRepository.findAll();

        double avgResponseHours = allHistories.stream()
                .filter(h -> h.getFirstResponseAt() != null && h.getCreatedAt() != null)
                .mapToLong(h -> Duration.between(h.getCreatedAt(), h.getFirstResponseAt()).toMinutes())
                .average()
                .orElse(0.0) / 60.0;

        double avgResolutionHours = allHistories.stream()
                .filter(h -> h.getCompletedAt() != null && h.getCreatedAt() != null)
                .mapToLong(h -> Duration.between(h.getCreatedAt(), h.getCompletedAt()).toMinutes())
                .average()
                .orElse(0.0) / 60.0;

        return SLADashboardDTO.builder()
                .totalSLABreaches(totalBreaches)
                .todayBreaches(todayBreaches)
                .overdueWorkOrders(overdue)
                .upcomingDeadlines(upcoming)
                .averageResponseTimeHours(Math.round(avgResponseHours * 100.0) / 100.0)
                .averageResolutionTimeHours(Math.round(avgResolutionHours * 100.0) / 100.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> getAllConfigurations() {
        return configRepository.findAll().stream()
                .map(this::mapConfigToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SLAConfigurationDTO createConfiguration(SLAConfigurationDTO dto) {
        SLAConfiguration config = SLAConfiguration.builder()
                .priority(dto.getPriority())
                .responseTimeHours(dto.getResponseTimeHours())
                .resolutionTimeHours(dto.getResolutionTimeHours())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        SLAConfiguration saved = configRepository.save(config);
        return mapConfigToDTO(saved);
    }

    @Override
    public SLAConfigurationDTO updateConfiguration(Long id, SLAConfigurationDTO dto) {
        SLAConfiguration config = configRepository.findById(id)
                .orElseThrow(() -> new SLANotFoundException("SLA Configuration not found with id: " + id));

        config.setResponseTimeHours(dto.getResponseTimeHours());
        config.setResolutionTimeHours(dto.getResolutionTimeHours());
        if (dto.getActive() != null) config.setActive(dto.getActive());

        SLAConfiguration updated = configRepository.save(config);
        return mapConfigToDTO(updated);
    }

    private SLAConfiguration getDefaultConfigForPriority(Priority priority) {
        int resp = 12;
        int res = 48;
        if (priority == Priority.LOW) { resp = 24; res = 72; }
        else if (priority == Priority.HIGH) { resp = 4; res = 24; }
        else if (priority == Priority.URGENT) { resp = 1; res = 8; }

        SLAConfiguration config = SLAConfiguration.builder()
                .priority(priority)
                .responseTimeHours(resp)
                .resolutionTimeHours(res)
                .active(true)
                .build();

        return configRepository.save(config);
    }

    private SLAHistoryDTO mapToDTO(SLAHistory history) {
        LocalDateTime now = LocalDateTime.now();
        boolean isOverdue = (history.getFirstResponseAt() == null && now.isAfter(history.getResponseDeadline())) ||
                            (history.getCompletedAt() == null && now.isAfter(history.getResolutionDeadline()));

        SLAHistoryDTO.SLAHistoryDTOBuilder builder = SLAHistoryDTO.builder()
                .id(history.getId())
                .responseDeadline(history.getResponseDeadline())
                .resolutionDeadline(history.getResolutionDeadline())
                .firstResponseAt(history.getFirstResponseAt())
                .completedAt(history.getCompletedAt())
                .responseBreached(history.getResponseBreached())
                .resolutionBreached(history.getResolutionBreached())
                .breachReason(history.getBreachReason())
                .isOverdue(isOverdue)
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt());

        if (history.getWorkOrder() != null) {
            builder.workOrderId(history.getWorkOrder().getId())
                   .workOrderNumber(history.getWorkOrder().getWorkOrderNumber())
                   .workOrderTitle(history.getWorkOrder().getTitle())
                   .priority(history.getWorkOrder().getPriority());
        }

        return builder.build();
    }

    private SLAConfigurationDTO mapConfigToDTO(SLAConfiguration config) {
        return SLAConfigurationDTO.builder()
                .id(config.getId())
                .priority(config.getPriority())
                .responseTimeHours(config.getResponseTimeHours())
                .resolutionTimeHours(config.getResolutionTimeHours())
                .active(config.getActive())
                .build();
    }
}

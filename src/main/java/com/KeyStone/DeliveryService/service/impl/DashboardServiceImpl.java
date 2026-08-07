package com.KeyStone.DeliveryService.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.DashboardSummaryDTO;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.PartRepository;
import com.KeyStone.DeliveryService.repository.SLAHistoryRepository;
import com.KeyStone.DeliveryService.repository.SiteRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderRepository workOrderRepository;
    private final SLAHistoryRepository slaHistoryRepository;
    private final PartRepository partRepository;
    private final UserAuthRepository userAuthRepository;

    @Override
    public DashboardSummaryDTO getDashboardSummary() {
        return buildDashboardSummary();
    }

    @Override
    public DashboardSummaryDTO getDashboardStatistics() {
        return buildDashboardSummary();
    }

    private DashboardSummaryDTO buildDashboardSummary() {
        long totalCust = customerRepository.count();
        long activeCust = customerRepository.countByActiveTrue();

        long totalSites = siteRepository.count();
        long activeSites = siteRepository.countByActiveTrue();

        long totalWO = workOrderRepository.count();
        long openWO = workOrderRepository.countByStatus(WorkOrderStatus.NEW);
        long assignedWO = workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED);
        long inProgressWO = workOrderRepository.countByStatusIn(
                Arrays.asList(WorkOrderStatus.STARTED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.RESUMED));
        long onHoldWO = workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD);
        long completedWO = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);
        long cancelledWO = workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todaysWO = workOrderRepository.findByCreatedAtBetween(startOfDay, endOfDay).size();
        long todaysCompleted = workOrderRepository.countByStatusAndCompletedAtBetween(WorkOrderStatus.COMPLETED, startOfDay, endOfDay);

        LocalDateTime now = LocalDateTime.now();
        long slaBreaches = slaHistoryRepository.findByResponseBreachedTrueOrResolutionBreachedTrue().size();
        long upcomingDeadlines = slaHistoryRepository.findUpcomingDeadlines(now, now.plusHours(2)).size();

        long totalParts = partRepository.count();
        long lowStockParts = partRepository.findLowStockParts().size();

        long totalTechs = userAuthRepository.countByRole(Role.TECHNICIAN);
        long activeTechs = totalTechs; // All registered technicians are active

        return DashboardSummaryDTO.builder()
                .totalCustomers(totalCust)
                .activeCustomers(activeCust)
                .totalSites(totalSites)
                .activeSites(activeSites)
                .totalWorkOrders(totalWO)
                .openWorkOrders(openWO)
                .assignedWorkOrders(assignedWO)
                .inProgressWorkOrders(inProgressWO)
                .onHoldWorkOrders(onHoldWO)
                .completedWorkOrders(completedWO)
                .cancelledWorkOrders(cancelledWO)
                .todaysWorkOrders(todaysWO)
                .todaysCompletedWorkOrders(todaysCompleted)
                .slaBreaches(slaBreaches)
                .upcomingSLADeadlines(upcomingDeadlines)
                .totalParts(totalParts)
                .lowStockParts(lowStockParts)
                .totalTechnicians(totalTechs)
                .activeTechnicians(activeTechs)
                .build();
    }
}

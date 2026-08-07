package com.KeyStone.DeliveryService.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.entity.SLAHistory;
import com.KeyStone.DeliveryService.repository.SLAHistoryRepository;
import com.KeyStone.DeliveryService.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SLAMonitorScheduler {

    private final SLAHistoryRepository historyRepository;
    private final NotificationService notificationService;

    // Runs every 15 minutes
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void monitorSLADeadlines() {
        log.info("Running SLA Monitor Scheduler...");
        LocalDateTime now = LocalDateTime.now();

        // 1. Detect Breaches
        List<SLAHistory> breachedList = historyRepository.findBreachedSLAs(now);
        for (SLAHistory history : breachedList) {
            boolean updated = false;

            if (history.getFirstResponseAt() == null && now.isAfter(history.getResponseDeadline()) && !Boolean.TRUE.equals(history.getResponseBreached())) {
                history.setResponseBreached(true);
                history.setBreachReason("Response deadline exceeded (" + history.getResponseDeadline() + ")");
                updated = true;
            }

            if (history.getCompletedAt() == null && now.isAfter(history.getResolutionDeadline()) && !Boolean.TRUE.equals(history.getResolutionBreached())) {
                history.setResolutionBreached(true);
                history.setBreachReason("Resolution deadline exceeded (" + history.getResolutionDeadline() + ")");
                updated = true;
            }

            if (updated) {
                historyRepository.save(history);
                notificationService.notifySLABreach(history);
                log.warn("SLA Breach detected and notification triggered for Work Order ID: {}", history.getWorkOrder().getId());
            }
        }

        // 2. Detect Upcoming Deadlines (within next 1 hour)
        LocalDateTime upcomingThreshold = now.plusHours(1);
        List<SLAHistory> upcomingList = historyRepository.findUpcomingDeadlines(now, upcomingThreshold);
        for (SLAHistory history : upcomingList) {
            notificationService.notifySLAWarning(history);
            log.info("SLA Warning notification sent for Work Order ID: {}", history.getWorkOrder().getId());
        }
    }
}

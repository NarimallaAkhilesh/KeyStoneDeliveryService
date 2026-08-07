package com.KeyStone.DeliveryService.scheduler;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.KeyStone.DeliveryService.entity.Part;
import com.KeyStone.DeliveryService.repository.PartRepository;
import com.KeyStone.DeliveryService.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockScheduler {

    private final PartRepository partRepository;
    private final NotificationService notificationService;

    // Runs daily at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void monitorLowStockParts() {
        log.info("Running Low Stock Monitor Scheduler...");
        List<Part> lowStockParts = partRepository.findLowStockParts();

        for (Part part : lowStockParts) {
            notificationService.notifyLowStock(part);
            log.warn("Low Stock Alert sent for Part: {} (Remaining: {})", part.getPartCode(), part.getQuantityAvailable());
        }
    }
}

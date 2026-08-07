package com.KeyStone.DeliveryService.service;

import com.KeyStone.DeliveryService.dto.DashboardSummaryDTO;

public interface DashboardService {

    DashboardSummaryDTO getDashboardSummary();

    DashboardSummaryDTO getDashboardStatistics();
}

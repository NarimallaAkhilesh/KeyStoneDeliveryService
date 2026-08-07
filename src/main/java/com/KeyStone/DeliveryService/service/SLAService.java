package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.SLAConfigurationDTO;
import com.KeyStone.DeliveryService.dto.SLADashboardDTO;
import com.KeyStone.DeliveryService.dto.SLAHistoryDTO;
import com.KeyStone.DeliveryService.entity.WorkOrder;

public interface SLAService {

    SLAHistoryDTO initializeSLAForWorkOrder(WorkOrder workOrder);

    void recordFirstResponse(Long workOrderId);

    void recordCompletion(Long workOrderId);

    SLAHistoryDTO getSLAForWorkOrder(Long workOrderId);

    List<SLAHistoryDTO> getBreachedSLAs();

    List<SLAHistoryDTO> getUpcomingDeadlines();

    SLADashboardDTO getSLADashboard();

    List<SLAConfigurationDTO> getAllConfigurations();

    SLAConfigurationDTO createConfiguration(SLAConfigurationDTO dto);

    SLAConfigurationDTO updateConfiguration(Long id, SLAConfigurationDTO dto);
}

package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.TimeLogRequestDTO;
import com.KeyStone.DeliveryService.dto.TimeLogResponseDTO;

public interface TimeLogService {

    TimeLogResponseDTO startTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail);

    TimeLogResponseDTO pauseTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail);

    TimeLogResponseDTO resumeTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail);

    TimeLogResponseDTO stopTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail);

    List<TimeLogResponseDTO> getWorkOrderTimeLogs(Long workOrderId);

    List<TimeLogResponseDTO> getTechnicianTimeLogs(Long technicianId);
}

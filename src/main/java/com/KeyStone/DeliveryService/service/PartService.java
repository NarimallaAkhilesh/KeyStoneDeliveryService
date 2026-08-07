package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.PartRequestDTO;
import com.KeyStone.DeliveryService.dto.PartResponseDTO;
import com.KeyStone.DeliveryService.dto.PartUsageRequestDTO;
import com.KeyStone.DeliveryService.dto.PartUsageResponseDTO;
import com.KeyStone.DeliveryService.dto.StockUpdateDTO;

public interface PartService {

    PartResponseDTO createPart(PartRequestDTO request);

    PartResponseDTO updatePart(Long id, PartRequestDTO request);

    void deletePart(Long id);

    PartResponseDTO activatePart(Long id);

    PartResponseDTO deactivatePart(Long id);

    PartResponseDTO restorePart(Long id);

    PartResponseDTO getPart(Long id);

    List<PartResponseDTO> getAllParts();

    List<PartResponseDTO> getLowStockParts();

    PartResponseDTO updateStock(Long id, StockUpdateDTO request);

    PartUsageResponseDTO addPartToWorkOrder(Long workOrderId, PartUsageRequestDTO request, String userEmail);

    List<PartUsageResponseDTO> getWorkOrderParts(Long workOrderId);

    void removePartFromWorkOrder(Long workOrderId, Long usageId);
}

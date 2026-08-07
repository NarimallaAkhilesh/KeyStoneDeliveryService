package com.KeyStone.DeliveryService.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.PartRequestDTO;
import com.KeyStone.DeliveryService.dto.PartResponseDTO;
import com.KeyStone.DeliveryService.dto.PartUsageRequestDTO;
import com.KeyStone.DeliveryService.dto.PartUsageResponseDTO;
import com.KeyStone.DeliveryService.dto.StockUpdateDTO;
import com.KeyStone.DeliveryService.entity.Part;
import com.KeyStone.DeliveryService.entity.PartUsage;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.exception.InsufficientStockException;
import com.KeyStone.DeliveryService.exception.PartNotFoundException;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.repository.PartRepository;
import com.KeyStone.DeliveryService.repository.PartUsageRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.PartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PartServiceImpl implements PartService {

    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserAuthRepository userAuthRepository;

    @Override
    public PartResponseDTO createPart(PartRequestDTO request) {
        String partCode = generatePartCode();

        Part part = Part.builder()
                .partCode(partCode)
                .partName(request.getPartName())
                .description(request.getDescription())
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .unitPrice(request.getUnitPrice())
                .quantityAvailable(request.getQuantityAvailable())
                .minimumStock(request.getMinimumStock())
                .active(true)
                .build();

        Part saved = partRepository.save(part);
        return mapToDTO(saved);
    }

    @Override
    public PartResponseDTO updatePart(Long id, PartRequestDTO request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));

        part.setPartName(request.getPartName());
        part.setDescription(request.getDescription());
        part.setCategory(request.getCategory());
        part.setManufacturer(request.getManufacturer());
        part.setUnitPrice(request.getUnitPrice());
        part.setQuantityAvailable(request.getQuantityAvailable());
        part.setMinimumStock(request.getMinimumStock());

        Part updated = partRepository.save(part);
        return mapToDTO(updated);
    }

    @Override
    public void deletePart(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));
        part.setActive(false);
        partRepository.save(part);
    }

    @Override
    public PartResponseDTO activatePart(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));
        part.setActive(true);
        Part saved = partRepository.save(part);
        return mapToDTO(saved);
    }

    @Override
    public PartResponseDTO deactivatePart(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));
        part.setActive(false);
        Part saved = partRepository.save(part);
        return mapToDTO(saved);
    }

    @Override
    public PartResponseDTO restorePart(Long id) {
        return activatePart(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PartResponseDTO getPart(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));
        return mapToDTO(part);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartResponseDTO> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartResponseDTO> getLowStockParts() {
        return partRepository.findLowStockParts().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PartResponseDTO updateStock(Long id, StockUpdateDTO request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + id));

        int newStock = part.getQuantityAvailable() + request.getQuantityToAdd();
        if (newStock < 0) {
            throw new InsufficientStockException("Stock level cannot become negative. Current: " + part.getQuantityAvailable());
        }

        part.setQuantityAvailable(newStock);
        Part saved = partRepository.save(part);
        return mapToDTO(saved);
    }

    @Override
    public PartUsageResponseDTO addPartToWorkOrder(Long workOrderId, PartUsageRequestDTO request, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new PartNotFoundException("Part not found with id: " + request.getPartId()));

        if (part.getQuantityAvailable() < request.getQuantityUsed()) {
            throw new InsufficientStockException("Insufficient stock for part '" + part.getPartName() +
                    "'. Available: " + part.getQuantityAvailable() + ", Requested: " + request.getQuantityUsed());
        }

        UserAuth user = null;
        if (userEmail != null && !userEmail.trim().isEmpty()) {
            user = userAuthRepository.findByUserEmail(userEmail).orElse(null);
        }

        // Deduct stock automatically
        part.setQuantityAvailable(part.getQuantityAvailable() - request.getQuantityUsed());
        partRepository.save(part);

        PartUsage usage = PartUsage.builder()
                .workOrder(workOrder)
                .part(part)
                .quantityUsed(request.getQuantityUsed())
                .unitPrice(part.getUnitPrice())
                .totalPrice(part.getUnitPrice() * request.getQuantityUsed())
                .remarks(request.getRemarks())
                .usedBy(user)
                .build();

        PartUsage saved = partUsageRepository.save(usage);
        return mapToUsageDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartUsageResponseDTO> getWorkOrderParts(Long workOrderId) {
        if (!workOrderRepository.existsById(workOrderId)) {
            throw new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId);
        }

        return partUsageRepository.findByWorkOrderId(workOrderId).stream()
                .map(this::mapToUsageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void removePartFromWorkOrder(Long workOrderId, Long usageId) {
        PartUsage usage = partUsageRepository.findById(usageId)
                .orElseThrow(() -> new RuntimeException("Part usage record not found with id: " + usageId));

        if (!usage.getWorkOrder().getId().equals(workOrderId)) {
            throw new RuntimeException("Part usage ID " + usageId + " does not belong to Work Order ID " + workOrderId);
        }

        // Return stock back to inventory
        Part part = usage.getPart();
        part.setQuantityAvailable(part.getQuantityAvailable() + usage.getQuantityUsed());
        partRepository.save(part);

        partUsageRepository.delete(usage);
    }

    private synchronized String generatePartCode() {
        Optional<Part> latest = partRepository.findTopByOrderByIdDesc();
        long nextId = latest.map(p -> p.getId() + 1).orElse(1L);
        return String.format("PART%04d", 1000 + nextId);
    }

    private PartResponseDTO mapToDTO(Part part) {
        boolean isLowStock = part.getQuantityAvailable() <= part.getMinimumStock();

        return PartResponseDTO.builder()
                .id(part.getId())
                .partCode(part.getPartCode())
                .partName(part.getPartName())
                .description(part.getDescription())
                .category(part.getCategory())
                .manufacturer(part.getManufacturer())
                .unitPrice(part.getUnitPrice())
                .quantityAvailable(part.getQuantityAvailable())
                .minimumStock(part.getMinimumStock())
                .active(part.getActive())
                .isLowStock(isLowStock)
                .createdAt(part.getCreatedAt())
                .updatedAt(part.getUpdatedAt())
                .build();
    }

    private PartUsageResponseDTO mapToUsageDTO(PartUsage usage) {
        PartUsageResponseDTO.PartUsageResponseDTOBuilder builder = PartUsageResponseDTO.builder()
                .id(usage.getId())
                .quantityUsed(usage.getQuantityUsed())
                .unitPrice(usage.getUnitPrice())
                .totalPrice(usage.getTotalPrice())
                .remarks(usage.getRemarks())
                .usedAt(usage.getUsedAt());

        if (usage.getWorkOrder() != null) {
            builder.workOrderId(usage.getWorkOrder().getId())
                   .workOrderNumber(usage.getWorkOrder().getWorkOrderNumber());
        }

        if (usage.getPart() != null) {
            builder.partId(usage.getPart().getId())
                   .partCode(usage.getPart().getPartCode())
                   .partName(usage.getPart().getPartName());
        }

        if (usage.getUsedBy() != null) {
            builder.usedById(usage.getUsedBy().getId())
                   .usedByName(usage.getUsedBy().getUserName());
        }

        return builder.build();
    }
}

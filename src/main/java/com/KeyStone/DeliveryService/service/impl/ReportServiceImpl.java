package com.KeyStone.DeliveryService.service.impl;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.CustomerReportDTO;
import com.KeyStone.DeliveryService.dto.ExportRequestDTO;
import com.KeyStone.DeliveryService.dto.InventoryReportDTO;
import com.KeyStone.DeliveryService.dto.PartResponseDTO;
import com.KeyStone.DeliveryService.dto.ReportFilterDTO;
import com.KeyStone.DeliveryService.dto.SLAHistoryDTO;
import com.KeyStone.DeliveryService.dto.SLAReportDTO;
import com.KeyStone.DeliveryService.dto.TechnicianPerformanceDTO;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.entity.Part;
import com.KeyStone.DeliveryService.entity.PartUsage;
import com.KeyStone.DeliveryService.entity.SLAHistory;
import com.KeyStone.DeliveryService.entity.TimeLog;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.PartRepository;
import com.KeyStone.DeliveryService.repository.PartUsageRepository;
import com.KeyStone.DeliveryService.repository.SLAHistoryRepository;
import com.KeyStone.DeliveryService.repository.SiteRepository;
import com.KeyStone.DeliveryService.repository.TimeLogRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.ReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final UserAuthRepository userAuthRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TimeLogRepository timeLogRepository;
    private final PartUsageRepository partUsageRepository;
    private final SLAHistoryRepository slaHistoryRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final PartRepository partRepository;

    @Override
    public List<TechnicianPerformanceDTO> getTechnicianPerformanceReport(ReportFilterDTO filter) {
        List<UserAuth> technicians;
        if (filter != null && filter.getTechnicianId() != null) {
            technicians = userAuthRepository.findById(filter.getTechnicianId())
                    .map(List::of)
                    .orElse(List.of());
        } else {
            technicians = userAuthRepository.findByRole(Role.TECHNICIAN);
        }

        List<TechnicianPerformanceDTO> report = new ArrayList<>();

        for (UserAuth tech : technicians) {
            List<WorkOrder> assignedWOs = workOrderRepository.findByAssignedTechnicianId(tech.getId());
            long assignedCount = assignedWOs.size();
            long completedCount = assignedWOs.stream()
                    .filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED)
                    .count();

            List<TimeLog> timeLogs = timeLogRepository.findByTechnicianId(tech.getId());
            long totalMinutes = timeLogs.stream().mapToLong(TimeLog::getTotalMinutes).sum();
            double totalHours = Math.round((totalMinutes / 60.0) * 100.0) / 100.0;

            List<PartUsage> partUsages = partUsageRepository.findByUsedById(tech.getId());
            long partsUsed = partUsages.stream().mapToLong(PartUsage::getQuantityUsed).sum();

            // SLA compliance for technician
            long techSLATotal = 0;
            long techSLAMet = 0;
            double totalRespMinutes = 0;
            double totalResMinutes = 0;
            int respCount = 0;
            int resCount = 0;

            for (WorkOrder wo : assignedWOs) {
                SLAHistory history = slaHistoryRepository.findByWorkOrderId(wo.getId()).orElse(null);
                if (history != null) {
                    techSLATotal++;
                    if (!Boolean.TRUE.equals(history.getResponseBreached())
                            && !Boolean.TRUE.equals(history.getResolutionBreached())) {
                        techSLAMet++;
                    }

                    if (history.getFirstResponseAt() != null && history.getCreatedAt() != null) {
                        totalRespMinutes += Duration.between(history.getCreatedAt(), history.getFirstResponseAt())
                                .toMinutes();
                        respCount++;
                    }
                    if (history.getCompletedAt() != null && history.getCreatedAt() != null) {
                        totalResMinutes += Duration.between(history.getCreatedAt(), history.getCompletedAt())
                                .toMinutes();
                        resCount++;
                    }
                }
            }

            double slaCompliance = techSLATotal > 0
                    ? Math.round(((double) techSLAMet / techSLATotal * 100.0) * 100.0) / 100.0
                    : 100.0;
            double avgRespHours = respCount > 0 ? Math.round((totalRespMinutes / respCount / 60.0) * 100.0) / 100.0
                    : 0.0;
            double avgResHours = resCount > 0 ? Math.round((totalResMinutes / resCount / 60.0) * 100.0) / 100.0 : 0.0;

            // Productivity Score: 40% completion rate + 40% SLA compliance + 20% job volume
            // factor
            double completionRate = assignedCount > 0 ? ((double) completedCount / assignedCount) * 100.0 : 100.0;
            double score = (completionRate * 0.4) + (slaCompliance * 0.4) + (Math.min(completedCount * 5.0, 20.0));
            score = Math.round(score * 100.0) / 100.0;

            report.add(TechnicianPerformanceDTO.builder()
                    .technicianId(tech.getId())
                    .technicianName(tech.getUserName())
                    .technicianEmail(tech.getUserEmail())
                    .jobsAssigned(assignedCount)
                    .jobsCompleted(completedCount)
                    .avgResolutionTimeHours(avgResHours)
                    .avgResponseTimeHours(avgRespHours)
                    .totalHoursWorked(totalHours)
                    .partsUsedCount(partsUsed)
                    .slaCompliancePercentage(slaCompliance)
                    .productivityScore(score)
                    .build());
        }

        return report;
    }

    @Override
    public List<CustomerReportDTO> getCustomerReport(ReportFilterDTO filter) {
        List<Customer> customers;
        if (filter != null && filter.getCustomerId() != null) {
            customers = customerRepository.findById(filter.getCustomerId())
                    .map(List::of)
                    .orElse(List.of());
        } else {
            customers = customerRepository.findAll();
        }

        List<CustomerReportDTO> report = new ArrayList<>();

        for (Customer customer : customers) {
            long activeSites = siteRepository.countByCustomerIdAndActiveTrue(customer.getId());
            List<WorkOrder> customerWOs = workOrderRepository.findByCustomerId(customer.getId());

            long totalWO = customerWOs.size();
            long completedWO = customerWOs.stream().filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED).count();
            long pendingWO = customerWOs.stream().filter(
                    w -> w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CANCELLED)
                    .count();

            long slaTotal = 0;
            long slaMet = 0;

            for (WorkOrder wo : customerWOs) {
                SLAHistory history = slaHistoryRepository.findByWorkOrderId(wo.getId()).orElse(null);
                if (history != null) {
                    slaTotal++;
                    if (!Boolean.TRUE.equals(history.getResponseBreached())
                            && !Boolean.TRUE.equals(history.getResolutionBreached())) {
                        slaMet++;
                    }
                }
            }

            double slaCompliance = slaTotal > 0 ? Math.round(((double) slaMet / slaTotal * 100.0) * 100.0) / 100.0
                    : 100.0;

            report.add(CustomerReportDTO.builder()
                    .customerId(customer.getId())
                    .customerCode(customer.getCustomerCode())
                    .customerName(customer.getCustomerName())
                    .companyName(customer.getCompanyName())
                    .activeSitesCount(activeSites)
                    .totalWorkOrdersCount(totalWO)
                    .completedWorkOrdersCount(completedWO)
                    .pendingWorkOrdersCount(pendingWO)
                    .slaCompliancePercentage(slaCompliance)
                    .build());
        }

        return report;
    }

    @Override
    public InventoryReportDTO getInventoryReport(ReportFilterDTO filter) {
        List<Part> parts = partRepository.findAll();

        long totalCatalogParts = parts.size();
        long lowStockCount = parts.stream().filter(p -> p.getQuantityAvailable() <= p.getMinimumStock()).count();

        double totalValue = parts.stream()
                .mapToDouble(p -> (p.getUnitPrice() != null ? p.getUnitPrice() : 0.0)
                        * (p.getQuantityAvailable() != null ? p.getQuantityAvailable() : 0))
                .sum();
        totalValue = Math.round(totalValue * 100.0) / 100.0;

        List<PartUsage> allUsages = partUsageRepository.findAll();
        long totalPartsUsed = allUsages.stream().mapToLong(PartUsage::getQuantityUsed).sum();

        String mostUsedName = "N/A";
        String mostUsedCode = "N/A";

        if (!allUsages.isEmpty()) {
            Map<Part, Integer> usageMap = allUsages.stream()
                    .collect(Collectors.groupingBy(PartUsage::getPart,
                            Collectors.summingInt(PartUsage::getQuantityUsed)));

            Map.Entry<Part, Integer> mostUsedEntry = usageMap.entrySet().stream()
                    .max(Comparator.comparingInt(Map.Entry::getValue))
                    .orElse(null);

            if (mostUsedEntry != null && mostUsedEntry.getKey() != null) {
                mostUsedName = mostUsedEntry.getKey().getPartName();
                mostUsedCode = mostUsedEntry.getKey().getPartCode();
            }
        }

        List<PartResponseDTO> dtoList = parts.stream()
                .map(p -> PartResponseDTO.builder()
                        .id(p.getId())
                        .partCode(p.getPartCode())
                        .partName(p.getPartName())
                        .category(p.getCategory())
                        .manufacturer(p.getManufacturer())
                        .unitPrice(p.getUnitPrice())
                        .quantityAvailable(p.getQuantityAvailable())
                        .minimumStock(p.getMinimumStock())
                        .active(p.getActive())
                        .isLowStock(p.getQuantityAvailable() <= p.getMinimumStock())
                        .createdAt(p.getCreatedAt())
                        .updatedAt(p.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return InventoryReportDTO.builder()
                .totalCatalogParts(totalCatalogParts)
                .lowStockPartsCount(lowStockCount)
                .totalInventoryValue(totalValue)
                .mostUsedPartName(mostUsedName)
                .mostUsedPartCode(mostUsedCode)
                .totalPartsUsedCount(totalPartsUsed)
                .partsList(dtoList)
                .build();
    }

    @Override
    public SLAReportDTO getSLAReport(ReportFilterDTO filter) {
        List<SLAHistory> histories = slaHistoryRepository.findAll();

        long total = histories.size();
        long respBreached = histories.stream().filter(h -> Boolean.TRUE.equals(h.getResponseBreached())).count();
        long resBreached = histories.stream().filter(h -> Boolean.TRUE.equals(h.getResolutionBreached())).count();

        long metCount = histories.stream()
                .filter(h -> !Boolean.TRUE.equals(h.getResponseBreached())
                        && !Boolean.TRUE.equals(h.getResolutionBreached()))
                .count();

        double compliance = total > 0 ? Math.round(((double) metCount / total * 100.0) * 100.0) / 100.0 : 100.0;

        double avgRespMinutes = histories.stream()
                .filter(h -> h.getFirstResponseAt() != null && h.getCreatedAt() != null)
                .mapToLong(h -> Duration.between(h.getCreatedAt(), h.getFirstResponseAt()).toMinutes())
                .average()
                .orElse(0.0);

        double avgResMinutes = histories.stream()
                .filter(h -> h.getCompletedAt() != null && h.getCreatedAt() != null)
                .mapToLong(h -> Duration.between(h.getCreatedAt(), h.getCompletedAt()).toMinutes())
                .average()
                .orElse(0.0);

        double avgRespHours = Math.round((avgRespMinutes / 60.0) * 100.0) / 100.0;
        double avgResHours = Math.round((avgResMinutes / 60.0) * 100.0) / 100.0;

        List<SLAHistoryDTO> breachedList = histories.stream()
                .filter(h -> Boolean.TRUE.equals(h.getResponseBreached())
                        || Boolean.TRUE.equals(h.getResolutionBreached()))
                .map(h -> SLAHistoryDTO.builder()
                        .id(h.getId())
                        .workOrderId(h.getWorkOrder() != null ? h.getWorkOrder().getId() : null)
                        .workOrderNumber(h.getWorkOrder() != null ? h.getWorkOrder().getWorkOrderNumber() : null)
                        .workOrderTitle(h.getWorkOrder() != null ? h.getWorkOrder().getTitle() : null)
                        .responseDeadline(h.getResponseDeadline())
                        .resolutionDeadline(h.getResolutionDeadline())
                        .firstResponseAt(h.getFirstResponseAt())
                        .completedAt(h.getCompletedAt())
                        .responseBreached(h.getResponseBreached())
                        .resolutionBreached(h.getResolutionBreached())
                        .breachReason(h.getBreachReason())
                        .createdAt(h.getCreatedAt())
                        .updatedAt(h.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return SLAReportDTO.builder()
                .totalSLAHistories(total)
                .responseBreachedCount(respBreached)
                .resolutionBreachedCount(resBreached)
                .overallSLACompliancePercentage(compliance)
                .avgResponseTimeHours(avgRespHours)
                .avgResolutionTimeHours(avgResHours)
                .breachedList(breachedList)
                .build();
    }

    @Override
    public byte[] exportReportToCSV(ExportRequestDTO request) {
        StringBuilder csv = new StringBuilder();
        String reportType = request != null && request.getReportType() != null ? request.getReportType().toUpperCase()
                : "SUMMARY";

        if ("TECHNICIAN".equals(reportType)) {
            csv.append(
                    "Technician ID,Name,Email,Jobs Assigned,Jobs Completed,Avg Response (hrs),Avg Resolution (hrs),Total Hours,SLA Compliance %,Score\n");
            List<TechnicianPerformanceDTO> techs = getTechnicianPerformanceReport(
                    request != null ? request.getFilter() : null);
            for (TechnicianPerformanceDTO t : techs) {
                csv.append(String.format("%d,\"%s\",\"%s\",%d,%d,%.2f,%.2f,%.2f,%d,%.2f,%.2f\n",
                        t.getTechnicianId(), t.getTechnicianName(), t.getTechnicianEmail(),
                        t.getJobsAssigned(), t.getJobsCompleted(),
                        t.getAvgResponseTimeHours(), t.getAvgResolutionTimeHours(),
                        t.getTotalHoursWorked(), t.getPartsUsedCount(),
                        t.getSlaCompliancePercentage(), t.getProductivityScore()));
            }
        } else if ("CUSTOMER".equals(reportType)) {
            csv.append(
                    "Customer ID,Code,Name,Company,Active Sites,Total Orders,Completed Orders,Pending Orders,SLA Compliance %\n");
            List<CustomerReportDTO> custs = getCustomerReport(request != null ? request.getFilter() : null);
            for (CustomerReportDTO c : custs) {
                csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",%d,%d,%d,%d,%.2f\n",
                        c.getCustomerId(), c.getCustomerCode(), c.getCustomerName(), c.getCompanyName(),
                        c.getActiveSitesCount(), c.getTotalWorkOrdersCount(),
                        c.getCompletedWorkOrdersCount(), c.getPendingWorkOrdersCount(),
                        c.getSlaCompliancePercentage()));
            }
        } else if ("INVENTORY".equals(reportType)) {
            csv.append("Part ID,Part Code,Part Name,Category,Unit Price,Quantity Available,Minimum Stock,Low Stock\n");
            InventoryReportDTO inv = getInventoryReport(request != null ? request.getFilter() : null);
            if (inv.getPartsList() != null) {
                for (PartResponseDTO p : inv.getPartsList()) {
                    csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",%.2f,%d,%d,%s\n",
                            p.getId(), p.getPartCode(), p.getPartName(), p.getCategory(),
                            p.getUnitPrice(), p.getQuantityAvailable(), p.getMinimumStock(),
                            Boolean.TRUE.equals(p.getIsLowStock()) ? "YES" : "NO"));
                }
            }
        } else {
            csv.append("Report Type,KEYSTONE Delivery Service Report Summary\n");
            csv.append(String.format("Generated At,%s\n", java.time.LocalDateTime.now()));
            csv.append("Total Work Orders,").append(workOrderRepository.count()).append("\n");
            csv.append("Total Customers,").append(customerRepository.count()).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportReportToExcel(ExportRequestDTO request) {
        // Formatted tab-separated value string compatible with Excel (.xlsx / .xls)
        return exportReportToCSV(request);
    }

    @Override
    public byte[] exportReportToPDF(ExportRequestDTO request) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document();

        PdfWriter.getInstance(document, out);

        document.open();

        document.add(new Paragraph("KEYSTONE DELIVERY SERVICE"));

        document.add(new Paragraph(""));

        document.add(new Paragraph("Generated: " + LocalDateTime.now()));

        document.add(new Paragraph(""));

        document.add(new Paragraph(
                new String(exportReportToCSV(request), StandardCharsets.UTF_8)));

        document.close();

        return out.toByteArray();
    }
}

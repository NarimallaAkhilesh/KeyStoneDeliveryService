package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.CustomerReportDTO;
import com.KeyStone.DeliveryService.dto.ExportRequestDTO;
import com.KeyStone.DeliveryService.dto.InventoryReportDTO;
import com.KeyStone.DeliveryService.dto.ReportFilterDTO;
import com.KeyStone.DeliveryService.dto.SLAReportDTO;
import com.KeyStone.DeliveryService.dto.TechnicianPerformanceDTO;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<TechnicianPerformanceDTO>>> getTechnicianReport(
            @RequestParam(required = false) Long technicianId) {

        ReportFilterDTO filter = ReportFilterDTO.builder().technicianId(technicianId).build();
        List<TechnicianPerformanceDTO> report = reportService.getTechnicianPerformanceReport(filter);
        return ResponseEntity.ok(ApiResponse.success("Technician Performance Report Fetched Successfully", report));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerReportDTO>>> getCustomerReport(
            @RequestParam(required = false) Long customerId) {

        ReportFilterDTO filter = ReportFilterDTO.builder().customerId(customerId).build();
        List<CustomerReportDTO> report = reportService.getCustomerReport(filter);
        return ResponseEntity.ok(ApiResponse.success("Customer Analytics Report Fetched Successfully", report));
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_PARTS')")
    public ResponseEntity<ApiResponse<InventoryReportDTO>> getInventoryReport() {
        InventoryReportDTO report = reportService.getInventoryReport(null);
        return ResponseEntity.ok(ApiResponse.success("Inventory Analytics Report Fetched Successfully", report));
    }

    @GetMapping("/sla")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_DASHBOARD')")
    public ResponseEntity<ApiResponse<SLAReportDTO>> getSLAReport(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority) {

        ReportFilterDTO filter = ReportFilterDTO.builder().status(status).priority(priority).build();
        SLAReportDTO report = reportService.getSLAReport(filter);
        return ResponseEntity.ok(ApiResponse.success("SLA Analytics Report Fetched Successfully", report));
    }

    @PostMapping("/export/pdf")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'SEND_NOTIFICATION')")
    public ResponseEntity<byte[]> exportToPDF(@RequestBody(required = false) ExportRequestDTO request) {
        byte[] pdfBytes = reportService.exportReportToPDF(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/export/excel")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'SEND_NOTIFICATION')")
    public ResponseEntity<byte[]> exportToExcel(@RequestBody(required = false) ExportRequestDTO request) {
        byte[] excelBytes = reportService.exportReportToExcel(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(excelBytes);
    }

    @PostMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'SEND_NOTIFICATION')")
    public ResponseEntity<byte[]> exportToCSV(@RequestBody(required = false) ExportRequestDTO request) {
        byte[] csvBytes = reportService.exportReportToCSV(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}

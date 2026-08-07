package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.CustomerReportDTO;
import com.KeyStone.DeliveryService.dto.ExportRequestDTO;
import com.KeyStone.DeliveryService.dto.InventoryReportDTO;
import com.KeyStone.DeliveryService.dto.ReportFilterDTO;
import com.KeyStone.DeliveryService.dto.SLAReportDTO;
import com.KeyStone.DeliveryService.dto.TechnicianPerformanceDTO;

public interface ReportService {

    List<TechnicianPerformanceDTO> getTechnicianPerformanceReport(ReportFilterDTO filter);

    List<CustomerReportDTO> getCustomerReport(ReportFilterDTO filter);

    InventoryReportDTO getInventoryReport(ReportFilterDTO filter);

    SLAReportDTO getSLAReport(ReportFilterDTO filter);

    byte[] exportReportToCSV(ExportRequestDTO request);

    byte[] exportReportToExcel(ExportRequestDTO request);

    byte[] exportReportToPDF(ExportRequestDTO request);
}

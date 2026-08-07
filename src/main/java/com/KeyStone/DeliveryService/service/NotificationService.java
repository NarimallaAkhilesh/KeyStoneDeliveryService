package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.EmailLogDTO;
import com.KeyStone.DeliveryService.dto.NotificationDTO;
import com.KeyStone.DeliveryService.entity.Part;
import com.KeyStone.DeliveryService.entity.SLAHistory;
import com.KeyStone.DeliveryService.entity.WorkOrder;

public interface NotificationService {

    String sendEmail(NotificationDTO notification);

    void notifyWorkOrderCreated(WorkOrder workOrder);

    void notifyTechnicianAssigned(WorkOrder workOrder);

    void notifyStatusChanged(WorkOrder workOrder, String oldStatus, String newStatus);

    void notifyLowStock(Part part);

    void notifySLAWarning(SLAHistory history);

    void notifySLABreach(SLAHistory history);

    List<EmailLogDTO> getEmailLogs();
}

package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.SiteRequestDTO;
import com.KeyStone.DeliveryService.dto.SiteResponseDTO;
import com.KeyStone.DeliveryService.dto.SiteUpdateDTO;

public interface SiteService {

    SiteResponseDTO createSite(SiteRequestDTO request);

    SiteResponseDTO updateSite(Long id, SiteUpdateDTO request);

    void deleteSite(Long id);

    SiteResponseDTO getSite(Long id);

    List<SiteResponseDTO> getAllSites();

    List<SiteResponseDTO> getAllSites(String statusFilter);

    List<SiteResponseDTO> getSitesByCustomer(Long customerId);

    List<SiteResponseDTO> searchSite(String name);

    SiteResponseDTO activateSite(Long id);

    SiteResponseDTO deactivateSite(Long id);

    SiteResponseDTO restoreSite(Long id);
}

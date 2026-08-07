package com.KeyStone.DeliveryService.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.SiteRequestDTO;
import com.KeyStone.DeliveryService.dto.SiteResponseDTO;
import com.KeyStone.DeliveryService.dto.SiteUpdateDTO;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.entity.Site;
import com.KeyStone.DeliveryService.exception.CustomerNotFoundException;
import com.KeyStone.DeliveryService.exception.SiteNotFoundException;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.SiteRepository;
import com.KeyStone.DeliveryService.service.SiteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;

    @Override
    public SiteResponseDTO createSite(SiteRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + request.getCustomerId()));

        String siteCode = generateSiteCode();

        Site site = Site.builder()
                .siteCode(siteCode)
                .siteName(request.getSiteName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .active(true)
                .customer(customer)
                .build();

        Site savedSite = siteRepository.save(site);
        return mapToDTO(savedSite);
    }

    @Override
    public SiteResponseDTO updateSite(Long id, SiteUpdateDTO request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new SiteNotFoundException("Site not found with id: " + id));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + request.getCustomerId()));
            site.setCustomer(customer);
        }

        site.setSiteName(request.getSiteName());
        site.setAddress(request.getAddress());
        site.setCity(request.getCity());
        site.setState(request.getState());
        site.setCountry(request.getCountry());
        site.setPincode(request.getPincode());
        site.setLatitude(request.getLatitude());
        site.setLongitude(request.getLongitude());
        site.setContactPerson(request.getContactPerson());
        site.setContactPhone(request.getContactPhone());
        site.setContactEmail(request.getContactEmail());

        Site updatedSite = siteRepository.saveAndFlush(site);
        return mapToDTO(updatedSite);
    }

    @Override
    public void deleteSite(Long id) {
        deactivateSite(id);
    }

    @Override
    @Transactional(readOnly = true)
    public SiteResponseDTO getSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new SiteNotFoundException("Site not found with id: " + id));
        return mapToDTO(site);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getAllSites() {
        return getAllSites("ALL");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getAllSites(String statusFilter) {
        List<Site> sites;
        if ("ACTIVE".equalsIgnoreCase(statusFilter)) {
            sites = siteRepository.findByActiveTrue();
        } else if ("INACTIVE".equalsIgnoreCase(statusFilter)) {
            sites = siteRepository.findByActiveFalse();
        } else {
            sites = siteRepository.findAll();
        }
        return sites.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getSitesByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }

        return siteRepository.findByCustomerIdAndActiveTrue(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> searchSite(String name) {
        return siteRepository.findBySiteNameContainingIgnoreCase(name).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SiteResponseDTO activateSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new SiteNotFoundException("Site not found with id: " + id));
        site.setActive(true);
        return mapToDTO(siteRepository.save(site));
    }

    @Override
    public SiteResponseDTO deactivateSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new SiteNotFoundException("Site not found with id: " + id));
        site.setActive(false);
        return mapToDTO(siteRepository.save(site));
    }

    @Override
    public SiteResponseDTO restoreSite(Long id) {
        return activateSite(id);
    }

    private synchronized String generateSiteCode() {
        Optional<Site> latestSite = siteRepository.findTopByOrderByIdDesc();
        long nextId = latestSite.map(s -> s.getId() + 1).orElse(1L);
        return String.format("SITE%04d", 1000 + nextId);
    }

    private SiteResponseDTO mapToDTO(Site site) {
        SiteResponseDTO.SiteResponseDTOBuilder builder = SiteResponseDTO.builder()
                .id(site.getId())
                .siteCode(site.getSiteCode())
                .siteName(site.getSiteName())
                .address(site.getAddress())
                .city(site.getCity())
                .state(site.getState())
                .country(site.getCountry())
                .pincode(site.getPincode())
                .latitude(site.getLatitude())
                .longitude(site.getLongitude())
                .contactPerson(site.getContactPerson())
                .contactPhone(site.getContactPhone())
                .contactEmail(site.getContactEmail())
                .active(site.getActive())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt());

        if (site.getCustomer() != null) {
            builder.customerId(site.getCustomer().getId())
                   .customerName(site.getCustomer().getCustomerName())
                   .customerCode(site.getCustomer().getCustomerCode());
        }

        return builder.build();
    }
}

package com.KeyStone.DeliveryService.service;

import java.util.List;

import com.KeyStone.DeliveryService.dto.CustomerRequestDTO;
import com.KeyStone.DeliveryService.dto.CustomerResponseDTO;
import com.KeyStone.DeliveryService.dto.CustomerUpdateDTO;

public interface CustomerService {

    CustomerResponseDTO createCustomer(CustomerRequestDTO request);

    CustomerResponseDTO updateCustomer(Long id, CustomerUpdateDTO request);

    void deleteCustomer(Long id);

    CustomerResponseDTO getCustomer(Long id);

    CustomerResponseDTO getCustomerByEmail(String email);

    List<CustomerResponseDTO> getAllCustomers();

    List<CustomerResponseDTO> getAllCustomers(String statusFilter);

    List<CustomerResponseDTO> searchCustomer(String name);

    CustomerResponseDTO activateCustomer(Long id);

    CustomerResponseDTO deactivateCustomer(Long id);

    CustomerResponseDTO restoreCustomer(Long id);
}

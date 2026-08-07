package com.KeyStone.DeliveryService.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.CustomerRequestDTO;
import com.KeyStone.DeliveryService.dto.CustomerResponseDTO;
import com.KeyStone.DeliveryService.dto.CustomerUpdateDTO;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.exception.CustomerNotFoundException;
import com.KeyStone.DeliveryService.exception.DuplicateCustomerException;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.service.CustomerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerResponseDTO createCustomer(CustomerRequestDTO request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateCustomerException("Customer with email '" + request.getEmail() + "' already exists");
        }

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateCustomerException("Customer with phone '" + request.getPhone() + "' already exists");
        }

        String customerCode = generateCustomerCode();

        Customer customer = Customer.builder()
                .customerCode(customerCode)
                .customerName(request.getCustomerName())
                .companyName(request.getCompanyName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .alternatePhone(request.getAlternatePhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .gstNumber(request.getGstNumber())
                .active(true)
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return mapToDTO(savedCustomer);
    }

    @Override
    public CustomerResponseDTO updateCustomer(Long id, CustomerUpdateDTO request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));

        if (customerRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateCustomerException("Another customer with email '" + request.getEmail() + "' already exists");
        }

        if (customerRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw new DuplicateCustomerException("Another customer with phone '" + request.getPhone() + "' already exists");
        }

        customer.setCustomerName(request.getCustomerName());
        customer.setCompanyName(request.getCompanyName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAlternatePhone(request.getAlternatePhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setCountry(request.getCountry());
        customer.setPincode(request.getPincode());
        customer.setGstNumber(request.getGstNumber());

        Customer updatedCustomer = customerRepository.saveAndFlush(customer);
        return mapToDTO(updatedCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {
        deactivateCustomer(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
        return mapToDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found for email: " + email));
        return mapToDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getAllCustomers() {
        return getAllCustomers("ALL");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getAllCustomers(String statusFilter) {
        List<Customer> customers;
        if ("ACTIVE".equalsIgnoreCase(statusFilter)) {
            customers = customerRepository.findByActiveTrue();
        } else if ("INACTIVE".equalsIgnoreCase(statusFilter)) {
            customers = customerRepository.findByActiveFalse();
        } else {
            customers = customerRepository.findAll();
        }
        return customers.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> searchCustomer(String name) {
        return customerRepository.findByCustomerNameContainingIgnoreCase(name).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDTO activateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
        customer.setActive(true);
        return mapToDTO(customerRepository.save(customer));
    }

    @Override
    public CustomerResponseDTO deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
        customer.setActive(false);
        return mapToDTO(customerRepository.save(customer));
    }

    @Override
    public CustomerResponseDTO restoreCustomer(Long id) {
        return activateCustomer(id);
    }

    private synchronized String generateCustomerCode() {
        Optional<Customer> latestCustomer = customerRepository.findTopByOrderByIdDesc();
        long nextId = latestCustomer.map(c -> c.getId() + 1).orElse(1L);
        return String.format("CUST%04d", 1000 + nextId);
    }

    private CustomerResponseDTO mapToDTO(Customer customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .customerName(customer.getCustomerName())
                .companyName(customer.getCompanyName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .alternatePhone(customer.getAlternatePhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .country(customer.getCountry())
                .pincode(customer.getPincode())
                .gstNumber(customer.getGstNumber())
                .active(customer.getActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}

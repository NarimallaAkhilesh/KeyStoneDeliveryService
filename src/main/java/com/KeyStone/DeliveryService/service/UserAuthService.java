package com.KeyStone.DeliveryService.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.AuthResponseDTO;
import com.KeyStone.DeliveryService.dto.CustomerSignupRequestDTO;
import com.KeyStone.DeliveryService.dto.ForgotPasswordDTO;
import com.KeyStone.DeliveryService.dto.LoginRequestDTO;
import com.KeyStone.DeliveryService.dto.RegisterRequestDTO;
import com.KeyStone.DeliveryService.dto.ResetPasswordDTO;
import com.KeyStone.DeliveryService.dto.UserDTO;
import com.KeyStone.DeliveryService.entity.Customer;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.exception.DuplicateCustomerException;
import com.KeyStone.DeliveryService.repository.CustomerRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.security.EmailLogService;
import com.KeyStone.DeliveryService.security.JWTUtil;
import com.KeyStone.DeliveryService.security.TokenKillingService;

import jakarta.servlet.http.HttpServletRequest;

@Service
@Transactional
public class UserAuthService {

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailLogService emailLogService;

    @Autowired
    private TokenKillingService tokenKill;

    // ========================= REGISTER =========================

    public AuthResponseDTO register(RegisterRequestDTO register) {

        Optional<UserAuth> existingUser = userAuthRepo.findByUserEmail(register.getUserEmail());

        if (existingUser.isPresent()) {
            throw new RuntimeException("User already exists");
        }

        UserAuth user = UserAuth.builder()
                .userName(register.getUserName())
                .userEmail(register.getUserEmail())
                .password(passwordEncoder.encode(register.getPassword()))
                .phone(register.getPhone())
                .role(register.getRole())
                .build();

        userAuthRepo.save(user);

        String token = jwtUtil.generateToken(user);

        return new AuthResponseDTO(
                token,
                user.getUserName(),
                user.getUserEmail(),
                user.getRole().name(),
                "Register Successful");
    }

    // ========================= CUSTOMER SIGNUP =========================

    public AuthResponseDTO customerSignup(CustomerSignupRequestDTO signup) {
        if (userAuthRepo.findByUserEmail(signup.getEmail()).isPresent() || customerRepository.existsByEmail(signup.getEmail())) {
            throw new DuplicateCustomerException("User with email '" + signup.getEmail() + "' already exists");
        }

        if (customerRepository.existsByPhone(signup.getPhone())) {
            throw new DuplicateCustomerException("Customer with phone '" + signup.getPhone() + "' already exists");
        }

        String customerCode = generateCustomerCode();

        // 1. Create UserAuth account
        UserAuth user = UserAuth.builder()
                .userName(signup.getCustomerName())
                .userEmail(signup.getEmail())
                .password(passwordEncoder.encode(signup.getPassword()))
                .phone(signup.getPhone())
                .role(Role.CUSTOMER)
                .build();

        userAuthRepo.save(user);

        // 2. Create Customer profile
        Customer customer = Customer.builder()
                .customerCode(customerCode)
                .customerName(signup.getCustomerName())
                .companyName(signup.getCompanyName())
                .email(signup.getEmail())
                .phone(signup.getPhone())
                .alternatePhone(signup.getAlternatePhone())
                .address(signup.getAddress())
                .city(signup.getCity())
                .state(signup.getState())
                .country(signup.getCountry())
                .pincode(signup.getPincode())
                .gstNumber(signup.getGstNumber())
                .active(true)
                .build();

        customerRepository.save(customer);

        // 3. Send welcome email (logged in email_logs)
        emailLogService.sendWelcomeMail(signup.getEmail(), signup.getCustomerName(), customerCode);

        // 4. Generate JWT Token
        String token = jwtUtil.generateToken(user);

        return new AuthResponseDTO(
                token,
                user.getUserName(),
                user.getUserEmail(),
                user.getRole().name(),
                "Customer Signup Successful");
    }

    private synchronized String generateCustomerCode() {
        Optional<Customer> latestCustomer = customerRepository.findTopByOrderByIdDesc();
        long nextId = latestCustomer.map(c -> c.getId() + 1).orElse(1L);
        return String.format("CUST%04d", 1000 + nextId);
    }

    // ========================= LOGIN =========================

    public AuthResponseDTO login(LoginRequestDTO login) {

        UserAuth user = userAuthRepo.findByUserEmail(login.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponseDTO(
                token,
                user.getUserName(),
                user.getUserEmail(),
                user.getRole().name(),
                "Login Successful");
    }

    // ========================= FORGOT PASSWORD =========================

    public void forgotPassword(ForgotPasswordDTO forgotPassword) {

        UserAuth user = userAuthRepo.findByUserEmail(forgotPassword.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setTokenExpireTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000));

        userAuthRepo.save(user);

        emailLogService.sendResetPasswordMail(
                forgotPassword.getUserEmail(),
                token);
    }

    // ========================= RESET PASSWORD =========================

    public void resetPassword(ResetPasswordDTO resetPassword) {

        UserAuth user = userAuthRepo.findByResetToken(resetPassword.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getTokenExpireTime().before(new Date())) {
            throw new RuntimeException("Reset link has expired");
        }

        user.setPassword(passwordEncoder.encode(resetPassword.getNewPassword()));
        user.setResetToken(null);
        user.setTokenExpireTime(null);

        userAuthRepo.save(user);
    }

    // ========================= LOGOUT =========================

    public String logout(HttpServletRequest request) {

        String header = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(header);

        if (token != null) {
            tokenKill.blockTokenProcess(token);
        }

        return "Logged out successfully";
    }

    // ========================= GET USERS =========================

    public List<UserDTO> getAllUsers() {
        return userAuthRepo.findAll().stream()
                .map(u -> new UserDTO(u.getId(), u.getUserName(), u.getUserEmail(), u.getPhone(), u.getRole()))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(Role role) {
        return userAuthRepo.findByRole(role).stream()
                .map(u -> new UserDTO(u.getId(), u.getUserName(), u.getUserEmail(), u.getPhone(), u.getRole()))
                .collect(Collectors.toList());
    }
}
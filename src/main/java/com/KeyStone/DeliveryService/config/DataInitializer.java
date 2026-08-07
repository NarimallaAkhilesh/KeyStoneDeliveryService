package com.KeyStone.DeliveryService.config;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedOrUpdateUser("manager@gmail.com", "Manager@123", "Default Manager", Role.MANAGER, "9876543210");
        seedOrUpdateUser("dispatcher@keystone.com", "Dispatcher@123", "Default Dispatcher", Role.DISPATCHER, "9876543211");
        seedOrUpdateUser("technician@keystone.com", "Technician@123", "Default Technician", Role.TECHNICIAN, "9876543212");

        printUserConsoleNotice();
    }

    private void seedOrUpdateUser(String email, String rawPassword, String name, Role role, String phone) {
        Optional<UserAuth> existingOpt = userAuthRepository.findByUserEmail(email);

        if (existingOpt.isPresent()) {
            UserAuth user = existingOpt.get();
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userAuthRepository.save(user);
            log.info("Reset password for existing user: {}", email);
        } else {
            UserAuth newUser = UserAuth.builder()
                    .userEmail(email)
                    .userName(name)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .phone(phone)
                    .build();
            userAuthRepository.save(newUser);
            log.info("Seeded new default user: {}", email);
        }
    }

    private void printUserConsoleNotice() {
        System.out.println("\n==========================");
        System.out.println("DEFAULT TEST USERS");
        System.out.println("==========================");
        System.out.println("Manager");
        System.out.println("Email:");
        System.out.println("manager@gmail.com");
        System.out.println("\nPassword:");
        System.out.println("Manager@123");
        System.out.println("\nDispatcher");
        System.out.println("Email:");
        System.out.println("dispatcher@keystone.com");
        System.out.println("\nPassword:");
        System.out.println("Dispatcher@123");
        System.out.println("\nTechnician");
        System.out.println("Email:");
        System.out.println("technician@keystone.com");
        System.out.println("\nPassword:");
        System.out.println("Technician@123");
        System.out.println("==========================\n");
    }
}

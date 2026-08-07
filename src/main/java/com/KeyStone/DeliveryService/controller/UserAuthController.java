package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.AuthResponseDTO;
import com.KeyStone.DeliveryService.dto.CustomerSignupRequestDTO;
import com.KeyStone.DeliveryService.dto.ForgotPasswordDTO;
import com.KeyStone.DeliveryService.dto.LoginRequestDTO;
import com.KeyStone.DeliveryService.dto.RegisterRequestDTO;
import com.KeyStone.DeliveryService.dto.ResetPasswordDTO;
import com.KeyStone.DeliveryService.dto.UserDTO;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.service.UserAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user_auth")
public class UserAuthController {

    @Autowired
    private UserAuthService userAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO register) {
        return ResponseEntity.ok(userAuthService.register(register));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signup(@Valid @RequestBody CustomerSignupRequestDTO signup) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAuthService.customerSignup(signup));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO login) {
        return ResponseEntity.ok(userAuthService.login(login));
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDTO forgotPassword) {
        userAuthService.forgotPassword(forgotPassword);
        return ResponseEntity.ok("Reset password link sent to your email");
    }

    @PostMapping("/reset_password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetPassword) {
        userAuthService.resetPassword(resetPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        return ResponseEntity.ok(userAuthService.logout(request));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsers(@RequestParam(required = false) Role role) {
        List<UserDTO> users;
        if (role != null) {
            users = userAuthService.getUsersByRole(role);
        } else {
            users = userAuthService.getAllUsers();
        }
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }
}

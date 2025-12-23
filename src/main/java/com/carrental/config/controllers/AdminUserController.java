package com.carrental.config.controllers;

import com.carrental.config.core.entities.ApplicationUser;
import com.carrental.config.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<ApplicationUser> users = userRepository.findAll();
        
        List<UserResponse> response = users.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    private UserResponse mapToResponse(ApplicationUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .emailConfirmed(user.getEmailConfirmed() != null && user.getEmailConfirmed())
                .roles(user.getRoles() != null ? 
                    user.getRoles().stream().collect(Collectors.toList()) : 
                    List.of())
                .createdAt(null) // Không có trường này trong entity
                .build();
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class UserResponse {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private boolean emailConfirmed;
        private List<String> roles;
        private String createdAt;
    }
}

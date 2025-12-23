package com.carrental.config.core.services;

import com.carrental.config.core.dtos.*;
import com.carrental.config.core.entities.ApplicationUser;
import com.carrental.config.core.entities.Role;
import com.carrental.config.core.interfaces.IEmailConfirmationService;
import com.carrental.config.core.interfaces.ICountryService;
import com.carrental.config.core.repositories.RoleRepository;
import com.carrental.config.core.repositories.UserRepository;
import com.carrental.config.core.shared.DomainErrors;
import com.carrental.config.core.shared.Error;
import com.carrental.config.core.shared.Result;
import com.carrental.config.core.shared.UserNotification;
import com.carrental.config.mappers.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

/**
 * Dịch vụ xử lý logic nghiệp vụ liên quan đến người dùng.
 */
@Service
public class  UserService {

    public final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final IEmailConfirmationService emailConfirmationService;
    private final ICountryService countryService;
    private final RoleRepository roleRepository;

    private void publishNotification(UserNotification notification) {
        System.out.println("NOTIFICATION [" + notification.getType() + "]: " + notification.getMessage());
    }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper,
                       IEmailConfirmationService emailConfirmationService, ICountryService countryService, RoleRepository repository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.emailConfirmationService = emailConfirmationService;
        this.countryService = countryService;
        this.roleRepository = repository;
    }

    @Transactional
    public Result<Void> registerUser(RegisterUserCommand request) {
        if (!countryService.isValidCountry(request.getCountry())) {
            return Result.validationFailure(new Error("Country.Invalid", "Invalid country selected."));
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return Result.failure(new Error("User.EmailExist", "User with this email already exists."));
        }

        ApplicationUser user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNormalizedEmail(request.getEmail().toUpperCase());
        user.setNormalizedUserName(request.getEmail().toUpperCase());
        user.setEmailConfirmed(true);
        user.setSecurityStamp(java.util.UUID.randomUUID().toString());
        user.setConcurrencyStamp(java.util.UUID.randomUUID().toString());
        
        // Set default values for required fields
        user.setAddressLine1("");
        user.setCity("");
        user.setDriversLicenseNumber("");
        
        // Set role as transient (will be managed separately if needed)
        // Lấy role "Client" từ DB
        Role clientRole = roleRepository.findByName("Client")
                .orElseThrow(() -> new RuntimeException("Role 'Client' not found in database"));

// gắn vào quan hệ ManyToMany
        user.getRoleEntities().add(clientRole);

// đồng bộ set roles transient để getAuthorities() dùng
        user.setRoles(Set.of("Client"));


        try {
            userRepository.save(user);
            publishNotification(UserNotification.success("Registration successful! You can now login."));
            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            publishNotification(UserNotification.error("Registration failed: " + e.getMessage()));
            return Result.failure(DomainErrors.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public Result<Void> registerAdmin(RegisterUserCommand request) {
        if (!countryService.isValidCountry(request.getCountry())) {
            return Result.validationFailure(new Error("Country.Invalid", "Invalid country selected."));
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return Result.failure(new Error("User.EmailExist", "User with this email already exists."));
        }

        ApplicationUser user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNormalizedEmail(request.getEmail().toUpperCase());
        user.setNormalizedUserName(request.getEmail().toUpperCase());
        user.setEmailConfirmed(true);
        user.setSecurityStamp(java.util.UUID.randomUUID().toString());
        user.setConcurrencyStamp(java.util.UUID.randomUUID().toString());
        
        // Set default values for required fields
        user.setAddressLine1("");
        user.setCity("");
        user.setDriversLicenseNumber("");
        
        // Set admin role
        Role clientRole = roleRepository.findByName("Client")
                .orElseThrow(() -> new RuntimeException("Role 'Client' not found in database"));

        Role adminRole = roleRepository.findByName("Admin")
                .orElseThrow(() -> new RuntimeException("Role 'Admin' not found in database"));

// Gắn vào bảng UserRoles
        user.getRoleEntities().add(clientRole);
        user.getRoleEntities().add(adminRole);

// Đồng bộ transient roles
        user.setRoles(Set.of("Client", "Admin"));


        try {
            userRepository.save(user);
            publishNotification(UserNotification.success("Admin registration successful! You can now login."));
            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            publishNotification(UserNotification.error("Admin registration failed: " + e.getMessage()));
            return Result.failure(DomainErrors.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public Result<Void> updateUserProfile(String userId, UpdateUserCommand request) {
        Optional<ApplicationUser> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return Result.failure(DomainErrors.USER_WITH_ID_NOT_FOUND);
        }

        ApplicationUser user = userOptional.get();
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(request.getEmail());

        userMapper.updateEntityFromCommand(request, user);

        if (emailChanged) {
            user.setEmailConfirmed(false);
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            }
        }

        userRepository.save(user);

        publishNotification(UserNotification.success("Profile updated successfully."));

        if (emailChanged) {
            emailConfirmationService.sendConfirmationEmailAsync(user);
            publishNotification(UserNotification.warning("Please check your email to confirm your new account email."));
        }

        return Result.success();
    }

    @Transactional
    public Result<Void> resetPassword(ResetPasswordCommand request) {
        Optional<ApplicationUser> userOptional = userRepository.findById(request.getUserId());
        if (userOptional.isEmpty()) {
            return Result.failure(DomainErrors.USER_WITH_ID_NOT_FOUND);
        }

        ApplicationUser user = userOptional.get();
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        publishNotification(UserNotification.success("Your password has been reset successfully."));
        return Result.success();
    }

    public Result<Void> forgotPassword(ForgotPasswordCommand request) {
        Optional<ApplicationUser> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            Error error = DomainErrors.USER_WITH_EMAIL_NOT_FOUND;
            publishNotification(UserNotification.error(error));
            return Result.failure(error);
        }

        ApplicationUser user = userOptional.get();
        emailConfirmationService.sendPasswordResetEmailAsync(user);
        publishNotification(UserNotification.info("Password reset email has been sent."));

        return Result.success();
    }

    @Transactional
    public Result<Void> confirmEmail(ConfirmEmailCommand request) {
        Optional<ApplicationUser> userOptional = userRepository.findById(request.getUserId());
        if (userOptional.isEmpty()) {
            return Result.failure(DomainErrors.USER_WITH_ID_NOT_FOUND);
        }

        ApplicationUser user = userOptional.get();
        user.setEmailConfirmed(true);
        userRepository.save(user);

        publishNotification(UserNotification.success("Email confirmed successfully."));
        return Result.success();
    }

    public Result<CurrentUserResponse> getCurrentUser(String email) {
        Optional<ApplicationUser> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return Result.failure(DomainErrors.USER_WITH_EMAIL_NOT_FOUND);
        }
        return Result.success(userMapper.toResponse(userOptional.get()));
    }

    public Result<ApplicationUser> findUserByEmail(String email) {
        Optional<ApplicationUser> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return Result.failure(DomainErrors.USER_WITH_EMAIL_NOT_FOUND);
        }
        return Result.success(userOptional.get());
    }
}

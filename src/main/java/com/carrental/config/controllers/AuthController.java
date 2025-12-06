package com.carrental.config.controllers;

import com.carrental.config.core.dtos.*;
import com.carrental.config.core.services.UserService;
import com.carrental.config.core.shared.DomainErrors;
import com.carrental.config.core.shared.Result;
import com.carrental.config.core.entities.ApplicationUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cho việc xác thực (Authentication) và quản lý tài khoản.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    private ResponseEntity<Object> handleResultFailure(Result<?> result) {
        if (DomainErrors.VALIDATION_ERROR.equals(result.getError())) {
            // Trả về danh sách các lỗi validation chi tiết
            return new ResponseEntity<>(result.getValidationErrors(), HttpStatus.BAD_REQUEST);
        }
        // Trả về lỗi nghiệp vụ chung
        return new ResponseEntity<>(new ErrorResponse(result.getError()), HttpStatus.BAD_REQUEST);
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterUserCommand command) {
        Result<Void> result = userService.registerUser(command);
        return result.isSuccess()
                ? new ResponseEntity<>(HttpStatus.CREATED)
                : handleResultFailure(result);
    }

    // POST /api/auth/register-admin
    @PostMapping("/register-admin")
    public ResponseEntity<Object> registerAdmin(@Valid @RequestBody RegisterUserCommand command) {
        Result<Void> result = userService.registerAdmin(command);
        return result.isSuccess()
                ? new ResponseEntity<>(HttpStatus.CREATED)
                : handleResultFailure(result);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginUserCommand command, 
                                       jakarta.servlet.http.HttpServletRequest request,
                                       jakarta.servlet.http.HttpServletResponse response) {
        // 1. Kiểm tra logic nghiệp vụ (EmailConfirmed)
        Result<Void> preCheckResult = preLoginChecks(command);
        if (preCheckResult.isFailure()) {
            return handleResultFailure(preCheckResult);
        }

        // 2. Thực hiện xác thực và tạo session
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(command.getEmail(), command.getPassword())
            );

            // Lưu authentication vào SecurityContext
            org.springframework.security.core.context.SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            
            // Lưu SecurityContext vào session
            jakarta.servlet.http.HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
            
            System.out.println("DEBUG - Login successful, session ID: " + session.getId());
            System.out.println("DEBUG - Authentication: " + authentication);

            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(DomainErrors.USER_CREDENTIALS_INVALID), HttpStatus.UNAUTHORIZED);
        }
    }

    private Result<Void> preLoginChecks(LoginUserCommand command) {
        Result<ApplicationUser> userResult = userService.findUserByEmail(command.getEmail());
        
        if (userResult.isFailure()) {
            return Result.failure(DomainErrors.USER_WITH_EMAIL_NOT_FOUND);
        }
        
        ApplicationUser user = userResult.getValue();
        if (!user.getEmailConfirmed()) {
            System.out.println("NOTIFICATION [Error]: Email address must be confirmed first");
            return Result.failure(DomainErrors.USER_EMAIL_NOT_CONFIRMED);
        }
        return Result.success();
    }

    // GET /api/auth/logout
    @GetMapping("/logout")
    public ResponseEntity<Object> logout() {
        SecurityContextHolder.clearContext();
        System.out.println("NOTIFICATION [Info]: You've been logged out");
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // GET /api/auth/confirm-email?userId=...&token=...
    @GetMapping("/confirm-email")
    public ResponseEntity<Object> confirmEmail(@RequestParam String userId, @RequestParam String token) {
        Result<Void> result = userService.confirmEmail(new ConfirmEmailCommand(userId, token));
        return result.isSuccess()
                ? new ResponseEntity<>("Email confirmed. You can now log in.", HttpStatus.OK)
                : handleResultFailure(result);
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@Valid @RequestBody ForgotPasswordCommand command) {
        Result<Void> result = userService.forgotPassword(command);
        return new ResponseEntity<>("If the email exists, a password reset link has been sent.", HttpStatus.OK);
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@Valid @RequestBody ResetPasswordCommand command) {
        Result<Void> result = userService.resetPassword(command);
        return result.isSuccess()
                ? new ResponseEntity<>("Password reset successfully.", HttpStatus.OK)
                : handleResultFailure(result);
    }

    // GET /api/auth/profile
    @GetMapping("/profile")
    public ResponseEntity<Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("DEBUG - Authentication: " + auth);
        System.out.println("DEBUG - Principal: " + (auth != null ? auth.getPrincipal() : "null"));
        System.out.println("DEBUG - Authenticated: " + (auth != null ? auth.isAuthenticated() : "false"));
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            System.out.println("DEBUG - User not authenticated");
            return new ResponseEntity<>(new ErrorResponse(DomainErrors.USER_CREDENTIALS_INVALID), HttpStatus.UNAUTHORIZED);
        }
        
        String email = auth.getName();
        System.out.println("DEBUG - Email: " + email);
        Result<CurrentUserResponse> result = userService.getCurrentUser(email);

        return result.isSuccess()
                ? new ResponseEntity<>(result.getValue(), HttpStatus.OK)
                : handleResultFailure(result);
    }

    // PUT /api/auth/profile
    @PutMapping("/profile")
    public ResponseEntity<Object> updateProfile(@Valid @RequestBody UpdateUserCommand command) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Result<ApplicationUser> userResult = userService.findUserByEmail(email);
        
        if (userResult.isFailure()) {
            return new ResponseEntity<>(new ErrorResponse(DomainErrors.USER_WITH_EMAIL_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        
        String userId = userResult.getValue().getId();
        Result<Void> result = userService.updateUserProfile(userId, command);

        return result.isSuccess()
                ? new ResponseEntity<>("Profile updated successfully.", HttpStatus.OK)
                : handleResultFailure(result);
    }
}

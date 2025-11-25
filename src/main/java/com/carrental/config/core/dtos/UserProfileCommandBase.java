package com.carrental.config.core.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Lớp cơ sở cho các Command/DTO có thông tin hồ sơ người dùng.
 */
@EqualsAndHashCode(callSuper = true)
@Data
public abstract class UserProfileCommandBase extends UserCredentialsCommandBase {

    @NotEmpty(message = "First Name is required.")
    @Size(max = 50, message = "First Name cannot be longer than 50 characters.")
    private String firstName;

    @NotEmpty(message = "Last Name is required.")
    @Size(max = 50, message = "Last Name cannot be longer than 50 characters.")
    private String lastName;

    private String username;

    @NotEmpty(message = "Phone Number is required.")
    @Pattern(regexp = "^\\d{10}$", message = "Phone Number must be 10 digits.")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    @NotEmpty(message = "Address Line 1 is required.")
    @Size(max = 100, message = "Address Line 1 cannot be longer than 100 characters.")
    private String addressLine1;

    @Size(max = 100, message = "Address Line 2 cannot be longer than 100 characters.")
    private String addressLine2;

    @NotEmpty(message = "City is required.")
    @Size(max = 50, message = "City cannot be longer than 50 characters.")
    private String city;

    @NotEmpty(message = "Country is required.")
    @Size(max = 50, message = "Country cannot be longer than 50 characters.")
    private String country;

    @NotEmpty(message = "Driver's License Number is required.")
    @Size(max = 20, message = "Driver's License Number cannot be longer than 20 characters.")
    private String driversLicenseNumber;
}
package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class ApplicationUser implements UserDetails {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "Id", columnDefinition = "NVARCHAR(450)")
    private String id;

    @Column(name = "Email", length = 256)
    private String email;

    @Column(name = "NormalizedEmail", length = 256)
    private String normalizedEmail;

    @Column(name = "UserName", length = 256)
    private String username;

    @Column(name = "NormalizedUserName", length = 256)
    private String normalizedUserName;

    @Column(name = "PasswordHash")
    private String passwordHash;

    @Column(name = "FirstName", length = 50, nullable = false)
    private String firstName;

    @Column(name = "LastName", length = 50, nullable = false)
    private String lastName;

    @Column(name = "Country", length = 50, nullable = false)
    private String country;

    @Column(name = "EmailConfirmed", nullable = false)
    private Boolean emailConfirmed = false;

    // ASP.NET Identity fields
    @Column(name = "SecurityStamp")
    private String securityStamp;

    @Column(name = "ConcurrencyStamp")
    private String concurrencyStamp;

    @Column(name = "PhoneNumber", length = 450)
    private String phoneNumber;

    @Column(name = "PhoneNumberConfirmed", nullable = false)
    private Boolean phoneNumberConfirmed = false;

    @Column(name = "TwoFactorEnabled", nullable = false)
    private Boolean twoFactorEnabled = false;

    @Column(name = "LockoutEnd")
    private java.time.OffsetDateTime lockoutEnd;

    @Column(name = "LockoutEnabled", nullable = false)
    private Boolean lockoutEnabled = true;

    @Column(name = "AccessFailedCount", nullable = false)
    private Integer accessFailedCount = 0;

    // Required fields from database
    @Column(name = "AddressLine1", length = 100, nullable = false)
    private String addressLine1 = "";

    @Column(name = "AddressLine2", length = 100)
    private String addressLine2;

    @Column(name = "City", length = 50, nullable = false)
    private String city = "";

    @Column(name = "DriversLicenseNumber", length = 20, nullable = false)
    private String driversLicenseNumber = "";

    @Column(name = "DateOfBirth")
    private java.time.LocalDateTime dateOfBirth;

    @Transient
    private Set<String> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return emailConfirmed;
    }
}

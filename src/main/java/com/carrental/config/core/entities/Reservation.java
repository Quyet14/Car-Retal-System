package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Đại diện cho một đơn đặt thuê xe.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false)
    private ApplicationUser user;

    @Column(name = "StartDate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "PickupLocation")
    private String pickupLocation;

    @Column(name = "FullName")
    private String fullName;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Email")
    private String email;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "TotalPrice")
    private Double totalPrice;

    public enum ReservationStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
}
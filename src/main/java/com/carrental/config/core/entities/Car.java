package com.carrental.config.core.entities;

import com.carrental.config.enums.CarStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MakeId", nullable = false, columnDefinition = "NVARCHAR(450)")
    private CarBrand make;

    @Column(name = "Model", nullable = false)
    private String model;

    @Column(name = "Year", nullable = false)
    private Integer year;

    // --- BỔ SUNG CÁC TRƯỜNG CÒN THIẾU ---
    @Column(name = "Seats", nullable = false)
    private Integer seats = 4; // Mặc định 4 chỗ

    @Column(name = "Transmission", nullable = false)
    private String transmission = "Tự động";

    @Column(name = "Fuel", nullable = false)
    private String fuel = "Xăng";
    // ------------------------------------

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "LocationId", nullable = false, columnDefinition = "NVARCHAR(450)")
    private Location location;

    @Column(name = "ImageName", length = 256, nullable = false)
    private String imageName = "";

    @Column(name = "Amount", nullable = false)
    private Double amount;

    // Tạm thời comment isDeleted
    // @Column(name = "IsDeleted", nullable = false)
    // private Boolean isDeleted = false;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Reservation> reservations = new HashSet<>();

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    private Set<CarImage> images = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CarStatus status = CarStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private ApplicationUser owner;
}
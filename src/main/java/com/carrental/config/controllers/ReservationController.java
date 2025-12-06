package com.carrental.config.controllers;

import com.carrental.config.core.dtos.CreateReservationCommand;
import com.carrental.config.core.dtos.ReservationResponse;
import com.carrental.config.core.entities.ApplicationUser;
import com.carrental.config.core.entities.Car;
import com.carrental.config.core.entities.Reservation;
import com.carrental.config.core.repositories.CarRepository;
import com.carrental.config.core.repositories.ReservationRepository;
import com.carrental.config.core.repositories.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getUserReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();
        ApplicationUser user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Reservation> reservations = reservationRepository.findByUserIdOrderByStartDateDesc(user.getId());
        List<ReservationResponse> response = reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody CreateReservationCommand command) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login to book a car");
        }

        String email = auth.getName();
        ApplicationUser user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        Car car = carRepository.findById(command.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        // Parse dates
        LocalDate startDate = LocalDate.parse(command.getStartDate());
        LocalDate endDate = LocalDate.parse(command.getEndDate());
        LocalTime startTime = command.getStartTime() != null ? 
                LocalTime.parse(command.getStartTime()) : LocalTime.of(9, 0);
        LocalTime endTime = command.getEndTime() != null ? 
                LocalTime.parse(command.getEndTime()) : LocalTime.of(18, 0);

        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        LocalDateTime end = LocalDateTime.of(endDate, endTime);

        // Calculate total price
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days == 0) days = 1;
        double totalPrice = days * car.getAmount();

        // Create reservation
        Reservation reservation = Reservation.builder()
                .car(car)
                .user(user)
                .startDate(start)
                .endDate(end)
                .status(Reservation.ReservationStatus.PENDING)
                .pickupLocation(command.getPickupLocation())
                .fullName(command.getFullName())
                .phone(command.getPhone())
                .email(command.getEmail())
                .notes(command.getNotes())
                .totalPrice(totalPrice)
                .build();

        reservation = reservationRepository.save(reservation);

        return ResponseEntity.ok(mapToResponse(reservation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();
        ApplicationUser user = userRepository.findByEmail(email).orElse(null);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // Check if reservation belongs to user
        if (!reservation.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        return ResponseEntity.ok().body("Reservation cancelled successfully");
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        Car car = reservation.getCar();
        long days = ChronoUnit.DAYS.between(
                reservation.getStartDate().toLocalDate(), 
                reservation.getEndDate().toLocalDate()
        );
        if (days == 0) days = 1;

        String statusText = switch (reservation.getStatus()) {
            case PENDING -> "Đang xử lý";
            case CONFIRMED -> "Đã xác nhận";
            case CANCELLED -> "Đã hủy";
            case COMPLETED -> "Hoàn thành";
        };

        return ReservationResponse.builder()
                .id(reservation.getId())
                .carId(car.getId())
                .carName(car.getMake().getName() + " " + car.getModel())
                .carImage(car.getImageName() != null ? car.getImageName() : 
                         "https://via.placeholder.com/200x150?text=" + car.getMake().getName())
                .startDate(reservation.getStartDate())
                .endDate(reservation.getEndDate())
                .status(statusText)
                .dailyRate(car.getAmount())
                .totalPrice(reservation.getTotalPrice())
                .days((int) days)
                .pickupLocation(reservation.getPickupLocation())
                .fullName(reservation.getFullName())
                .phone(reservation.getPhone())
                .email(reservation.getEmail())
                .notes(reservation.getNotes())
                .build();
    }
}

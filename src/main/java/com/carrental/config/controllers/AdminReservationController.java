package com.carrental.config.controllers;

import com.carrental.config.core.dtos.ReservationResponse;
import com.carrental.config.core.entities.Car;
import com.carrental.config.core.entities.Reservation;
import com.carrental.config.core.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminReservationController {

    private final ReservationRepository reservationRepository;

    @GetMapping("/all")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        List<ReservationResponse> response = reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmReservation(@PathVariable Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);
        
        return ResponseEntity.ok().body("Reservation confirmed successfully");
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeReservation(@PathVariable Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus(Reservation.ReservationStatus.COMPLETED);
        reservationRepository.save(reservation);
        
        return ResponseEntity.ok().body("Reservation completed successfully");
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
                .statusCode(reservation.getStatus() != null ? reservation.getStatus().name() : null)
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

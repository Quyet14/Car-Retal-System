package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByUserIdOrderByStartDateDesc(String userId);
    List<Reservation> findByCarIdOrderByStartDateDesc(Integer carId);
}

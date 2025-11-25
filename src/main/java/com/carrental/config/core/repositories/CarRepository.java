package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho Car Entity. (Spring Data JPA)
 */
@Repository
public interface CarRepository extends JpaRepository<Car, Integer>, JpaSpecificationExecutor<Car> {

    @Query("SELECT COUNT(r) FROM Reservation r " +
           "WHERE r.car.id = :carId AND r.startDate <= :date AND r.endDate >= :date")
    Long countReservedCarsOnDate(Integer carId, LocalDateTime date);

    List<Car> findAllByLocation_NameContainingIgnoreCase(String locationName);
}
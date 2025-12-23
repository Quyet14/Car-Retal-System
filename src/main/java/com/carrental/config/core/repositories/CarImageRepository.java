package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, String> {
    List<CarImage> findByCar_Id(Integer carId);

    void deleteByCar_Id(Integer carId);
}

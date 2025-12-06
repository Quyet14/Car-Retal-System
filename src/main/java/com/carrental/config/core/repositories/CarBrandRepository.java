package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarBrandRepository extends JpaRepository<CarBrand, Integer> {
    Optional<CarBrand> findByName(String name);
}

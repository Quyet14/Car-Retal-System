package com.carrental.config.controllers;

import com.carrental.config.core.entities.CarBrand;
import com.carrental.config.core.repositories.CarBrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminBrandController {

    private final CarBrandRepository carBrandRepository;

    @GetMapping
    public ResponseEntity<List<CarBrand>> getAllBrands() {
        List<CarBrand> brands = carBrandRepository.findAll();
        return ResponseEntity.ok(brands);
    }
}

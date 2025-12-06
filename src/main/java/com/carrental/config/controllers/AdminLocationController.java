package com.carrental.config.controllers;

import com.carrental.config.core.entities.Location;
import com.carrental.config.core.repositories.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminLocationController {

    private final LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return ResponseEntity.ok(locations);
    }
}

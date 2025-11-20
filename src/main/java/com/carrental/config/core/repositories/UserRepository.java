package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<ApplicationUser, String> {
    Optional<ApplicationUser> findByEmail(String email);
}

package com.carrental.config.core.repositories;


import com.carrental.config.core.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByName(String name);

    Optional<Role> findByNormalizedName(String normalizedName);
}

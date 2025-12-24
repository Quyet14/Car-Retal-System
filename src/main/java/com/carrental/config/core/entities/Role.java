package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Roles")
@Getter
@Setter
public class Role {

    @Id
    @Column(name = "Id", columnDefinition = "NVARCHAR(450)")
    private String id;

    @Column(name = "Name", length = 256)
    private String name;

    @Column(name = "NormalizedName", length = 256)
    private String normalizedName;

    @Column(name = "ConcurrencyStamp")
    private String concurrencyStamp;

    @ManyToMany(mappedBy = "roleEntities")
    private Set<ApplicationUser> users = new HashSet<>();
}

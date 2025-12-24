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

public class Role {
    @Id
    @Column(length = 450)
    private String id;

    @Column(length = 256, unique = true)
    private String name;

    @Column(length = 256)
    private String normalizedName;

    @Column
    private String concurrencyStamp;

    // Quan hệ ManyToMany với User
    @ManyToMany(mappedBy = "roleEntities")
    private Set<ApplicationUser> users = new HashSet<>();

    public Role() {
    }

    // ===== Getter / Setter =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.normalizedName = name != null ? name.toUpperCase() : null;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public void setNormalizedName(String normalizedName) {
        this.normalizedName = normalizedName;
    }

    public String getConcurrencyStamp() {
        return concurrencyStamp;
    }

    public void setConcurrencyStamp(String concurrencyStamp) {
        this.concurrencyStamp = concurrencyStamp;
    }

    public Set<ApplicationUser> getUsers() {
        return users;
    }

    public void setUsers(Set<ApplicationUser> users) {
        this.users = users;
    }

}

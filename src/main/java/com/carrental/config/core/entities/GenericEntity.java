package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Entity cơ sở cho các bảng cần thông tin kiểm toán (audit).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@MappedSuperclass
public abstract class GenericEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "date_create")
    private LocalDateTime dateCreate;

    @Column(name = "date_change")
    private LocalDateTime dateChange;

    @Column(name = "changed_by", length = 2000)
    private String changedBy;

    @Column(name = "create_by", length = 2000)
    private String createBy;

    @PrePersist
    protected void onCreate() {
        if (dateCreate == null) {
            dateCreate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dateChange = LocalDateTime.now();
    }
}
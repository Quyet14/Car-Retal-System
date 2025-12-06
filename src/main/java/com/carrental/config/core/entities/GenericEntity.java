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
    @Column(name = "Id", columnDefinition = "NVARCHAR(450)")
    private String id;

    @Column(name = "DateCreate")
    private LocalDateTime dateCreate;

    @Column(name = "DateChange")
    private LocalDateTime dateChange;

    @Column(name = "ChangedBy")
    private String changedBy;

    @Column(name = "CreateBy")
    private String createBy;

    @Column(name = "IsDeleted", nullable = false)
    private Boolean isDeleted = false;

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
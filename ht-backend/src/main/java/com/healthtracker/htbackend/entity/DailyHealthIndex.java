package com.healthtracker.htbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_health_index", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "date" }))
public class DailyHealthIndex {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    @NotNull
    private LocalDate date;

    @Column(name = "health_score", columnDefinition = "FLOAT(5,2)", nullable = false)
    @DecimalMin(value = "0.0", message = "Health score must be at least 0.0")
    @DecimalMax(value = "100.0", message = "Health score must not exceed 100.0")
    @NotNull
    private Float healthScore;

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public DailyHealthIndex() {
    }

    public DailyHealthIndex(User user, LocalDate date, Float healthScore) {
        this.user = user;
        this.date = date != null ? date : LocalDate.now();
        this.healthScore = healthScore;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Float getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Float healthScore) {
        this.healthScore = healthScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDate.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
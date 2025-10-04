package com.healthtracker.htbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_intake")
public class WaterIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(name = "amount_ltr", columnDefinition = "FLOAT(4,2)", nullable = false)
    @DecimalMin(value = "0.1", message = "Water amount must be at least 0.1 liters")
    @DecimalMax(value = "10.0", message = "Water amount must not exceed 10.0 liters")
    @NotNull
    private Float amountLtr;

    @Column(columnDefinition = "DATE DEFAULT CURRENT_DATE", nullable = false)
    private LocalDate date;

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public WaterIntake() {}

    public WaterIntake(User user, Float amountLtr, LocalDate date) {
        this.user = user;
        this.amountLtr = amountLtr;
        this.date = date != null ? date : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Float getAmountLtr() { return amountLtr; }
    public void setAmountLtr(Float amountLtr) { this.amountLtr = amountLtr; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

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
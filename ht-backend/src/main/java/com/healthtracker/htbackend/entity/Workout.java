package com.healthtracker.htbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(length = 100, nullable = false)
    @NotBlank(message = "Activity cannot be blank")
    @Size(min = 1, max = 100, message = "Activity must be between 1 and 100 characters")
    private String activity;

    @Column(name = "duration_min", nullable = false)
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    @NotNull
    private Integer durationMin;

    @Column(name = "calories_burned") // NULL allowed as per schema
    @Min(value = 0, message = "Calories burned must be at least 0")
    @Max(value = 2000, message = "Calories burned must not exceed 2000")
    private Integer caloriesBurned;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Workout() {}

    public Workout(User user, String activity, Integer durationMin, Integer caloriesBurned, LocalDate date) {
        this.user = user;
        this.activity = activity;
        this.durationMin = durationMin;
        this.caloriesBurned = caloriesBurned;
        this.date = date != null ? date : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public Integer getCaloriesBurned() { return caloriesBurned; }
    public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }

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
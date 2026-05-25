package com.Kart.Attendance.Entity;


import java.time.LocalDate;

import com.Kart.Attendance.Entity.Type.Subscription_year;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.Transient;

@Entity
@Getter
@Setter
@Table(indexes = {
    @Index(name = "idx_admin_auth_token", columnList = "authToken"),
    @Index(name = "idx_admin_status", columnList = "status")
})
public class Admin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String name;

    @Column(nullable = false, unique = true)
    @Email(message = "Invalid email address")
    private String email;

    @JsonProperty("organisation_name")
    private String Organisation_name;

    @JsonProperty("organisation_address")
    private String Organisation_address = "461 Sai Sobagu, 1st Floor Outer Ring Road Teachers Colony, Sector 6 HSR Layout Bangalore Karnataka 560034 India";

    @JsonProperty("short_form")
    private String shortForm;
    
    @JsonProperty("phone_number")
    private String phone_number;

    private String password;

    @Column(unique = true)
    private String tenantId;

    private String authToken;

    @Column(unique = true)
    private String slug;

    private Subscription_year subscription_year;

    private LocalDate starting_date;

    private String lateThresholdTime = "10:30";
    private String defaultCheckInTime = "09:00";
    private String defaultCheckOutTime = "18:00";
    private int gracePeriod = 15;
    private double shiftDuration = 9.0;

    @JsonProperty("maxUsers")
    @JsonAlias("max_users")
    private Integer maxUsers = 100;

    @Transient
    @JsonProperty("userCount")
    private long userCount;

    private String status = "Active";

    private int sickLeavesLimit = 12;
    private int casualLeavesLimit = 12;
    private int emergencyLeavesLimit = 6;

    private double monthlyAccrualRate = 1.5;

    @Column(columnDefinition = "TEXT")
    private String declaredHolidays = "[]";

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String emailVerificationToken;
}

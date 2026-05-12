package com.Kart.Attendance.Entity;


import java.time.LocalDate;

import com.Kart.Attendance.Entity.Type.Subscription_year;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
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

    
}

package com.Kart.Attendance.Entity;

import java.time.LocalDate;

import com.Kart.Attendance.Entity.Type.User_Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Employee") // Good practice to use plural for tables, avoiding reserved keywords like "user" in some DBs
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false, unique = true)
    @Email(message = "Invalid email address")
    private String email;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private User_Role role;
    
    @Column(nullable = false)
    private String phoneNumber;

    private String department;

    private String designation;

    private LocalDate joiningDate;

    private String employeeCode;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @JsonIgnore
    private String authToken;

    private String gender;

}

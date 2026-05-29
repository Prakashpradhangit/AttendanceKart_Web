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
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Employee", indexes = {
    @Index(name = "idx_employee_tenant_role_status", columnList = "tenantId, role, status"),
    @Index(name = "idx_employee_tenant_code", columnList = "tenantId, employeeCode"),
    @Index(name = "idx_employee_auth_token", columnList = "authToken")
})
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

    private String employmentType = "FULL_TIME"; // INTERN, FULL_TIME, PROBATION

    private LocalDate joiningDate;

    private String employeeCode;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @JsonIgnore
    private String authToken;

    private String gender;

    private String address;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String emergencyContactAddress;

    private String maritalStatus;

    private String nationality;

    private LocalDate dob;

    private String bloodGroup;

    private String personalEmail;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    private String panNumber;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String panCard;

    private String aadharNumber;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String aadharCard;

    private String accountNumber;

    private String bankName;

    private String ifscCode;

    private String uanNumber;

    private String pfNumber;

    private String esiNumber;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String bankPassbook;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String lastPayslip;

    private String status = "Active";

    private Double basicSalary;

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String emailVerificationToken;

}

package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "salary_structures", indexes = {
    @Index(name = "idx_salary_struct_user", columnList = "userId, tenantId")
})
@Data
public class SalaryStructure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    // Structure mode: "MONTHLY" or "YEARLY"
    private String structureType = "MONTHLY";

    // Calculation mode: "FIXED" or "PERCENTAGE_BASED"
    private String calculationMode = "PERCENTAGE_BASED";

    // Base Components (Monthly rates)
    private double basicSalary;
    private double hraPercent = 40.0; // e.g. 40% of Basic
    private double daPercent = 0.0;
    private double pfPercent = 12.0;  // e.g. 12% of Basic
    private double esiPercent = 0.75; // e.g. 0.75% of Gross
    private double tdsPercent = 0.0;

    // Earnings
    private double hra;
    private double da;
    private double conveyanceAllowance;
    private double medicalAllowance;
    private double specialAllowance;
    private double otherAllowances;
    private double performanceBonus;
    private double incentives;
    private double overtime;
    private double otherEarnings;

    // Deductions
    private double providentFund;
    private double esi;
    private double professionalTax = 200.0;
    private double tds;
    private double insurance;
    private double advanceDeduction;
    private double loanDeduction;
    private double otherDeductions;

    // Configuration Settings
    private double monthlyCtc;
    private double grossSalary;
    private double netSalary;
    private String salaryType = "Monthly"; // Monthly / Hourly / Daily
    private String paymentMode = "Bank Transfer";
    private String payrollFrequency = "Monthly";
    private boolean active = true;

    // Banking & Statutory details associated with this structure version
    private String uanNumber;
    private String pfNumber;
    private String esiNumber;
    private String bankName;
    private String ifscCode;
    private String accountNumber;
}

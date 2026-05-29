package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "salary_templates", indexes = {
    @Index(name = "idx_salary_template_tenant", columnList = "tenantId")
})
@Data
public class SalaryTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String name; // e.g. "Software Engineer L1", "Manager", "Intern"

    private boolean active = true;

    // Base Components (Monthly rates)
    private double basicSalary;
    private double hraPercent = 40.0; // 40% of Basic
    private double daPercent = 0.0;
    private double pfPercent = 12.0;  // 12% of Basic
    private double esiPercent = 0.75; // 0.75% of Gross
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
}

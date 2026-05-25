package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "payrolls", indexes = {
    @Index(name = "idx_payroll_tenant_month", columnList = "tenantId, month"),
    @Index(name = "idx_payroll_user_tenant_month", columnList = "userId, tenantId, month")
})
@Data
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private Long userId;

    private String employeeId;
    private String employeeName;
    private String designation;
    private String phoneNumber;
    private LocalDate doj;

    // Banking & Statutory Snapshots
    private String uanNumber;
    private String pfNumber;
    private String esiNumber;
    private String bankName;
    private String ifscCode;
    private String accountNumber;

    // Detailed LOP and Paid days proration values
    private double lopDays;
    private double paidDays;

    @Column(nullable = false)
    private String month; // format: "Month YYYY", e.g. "May 2026"

    // Earnings
    private double basicSalary;
    private double hra;
    private double conveyanceAllowance;
    private double medicalAllowance;
    private double specialAllowance;
    private double otherAllowances;
    private double performanceBonus;

    // Deductions
    private double providentFund;
    private double professionalTax;
    private double incomeTax;
    private double esi;
    private double otherDeductions;
    private double attendanceDeduction; // Deductions from absence or LOP leaves

    // Attendance stats
    private int totalDays;
    private int presentDays;
    private int absentDays;
    private int leaveDays;

    private double totalEarnings;
    private double totalDeductions;
    private double netSalary;

    // Employer Statutory Contributions
    private double employerPf;
    private double employerEsi;
    private double ctc;

    @Column(nullable = false)
    private String status; // "DRAFT", "PENDING", "PAID"

    // Payment details
    private String paymentMethod;
    private String transactionId;
    private LocalDate paymentDate;
    
    @Column(columnDefinition = "TEXT")
    private String note;
}

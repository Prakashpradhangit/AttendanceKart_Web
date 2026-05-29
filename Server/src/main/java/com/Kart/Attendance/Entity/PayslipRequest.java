package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payslip_requests", indexes = {
    @Index(name = "idx_payslip_tenant_status", columnList = "tenantId, status"),
    @Index(name = "idx_payslip_user_tenant", columnList = "userId, tenantId")
})
@Data
public class PayslipRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private Long userId;

    private String employeeName;
    private String employeeId;

    @Column(nullable = false)
    private String month; // format: "Month YYYY", e.g. "May 2026"

    @Column(nullable = false)
    private String requestDate; // Date when request was submitted

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(columnDefinition = "TEXT")
    private String reason;
}

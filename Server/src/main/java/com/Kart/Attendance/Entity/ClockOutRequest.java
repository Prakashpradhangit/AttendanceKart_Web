package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "clock_out_requests", indexes = {
    @Index(name = "idx_clockout_tenant_status", columnList = "tenantId, status"),
    @Index(name = "idx_clockout_user_tenant_date", columnList = "userId, tenantId, attendanceDate")
})
@Data
public class ClockOutRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tenantId;
    private String userId;
    private String employeeName;
    private String attendanceDate;
    private String requestedCheckInTime; // ISO timestamp or HH:mm
    private String requestedCheckOutTime; // ISO timestamp or HH:mm
    private String note;
    
    // PENDING, APPROVED, REJECTED
    private String status;
    private String createdAt;
}

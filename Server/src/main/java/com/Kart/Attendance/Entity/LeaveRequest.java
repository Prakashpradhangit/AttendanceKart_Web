package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "leave_requests", indexes = {
    @Index(name = "idx_leave_tenant_status", columnList = "tenantId, status"),
    @Index(name = "idx_leave_user_tenant_status", columnList = "userId, tenantId, status"),
    @Index(name = "idx_leave_tenant_dates", columnList = "tenantId, fromDate, toDate")
})
@Data
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tenantId;
    private String userId;
    private String leaveType;
    private String duration;
    private String fromDate;
    private String toDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private String leaveCategory = "Paid"; // Paid, LOP
}

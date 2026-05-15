package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "leave_requests")
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
}

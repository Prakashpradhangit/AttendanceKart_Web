package com.Kart.Attendance.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "clock_out_requests")
@Data
public class ClockOutRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tenantId;
    private String userId;
    private String employeeName;
    private String attendanceDate;
    private String requestedCheckOutTime; // ISO timestamp or HH:mm
    private String note;
    
    // PENDING, APPROVED, REJECTED
    private String status;
    private String createdAt;
}

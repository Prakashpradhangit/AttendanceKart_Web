package com.Kart.Attendance.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "attendance_details", indexes = {
    @Index(name = "idx_attendance_tenant_date", columnList = "tenantId, attendanceDate"),
    @Index(name = "idx_attendance_user_tenant_date", columnList = "userId, tenantId, attendanceDate"),
    @Index(name = "idx_attendance_user_tenant_checkout", columnList = "userId, tenantId, checkOutTime")
})
@Data
public class AttendanceDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tenantId;
    private String userId;
    private String userName;
    private String department;
    private String designation;
    private String attendanceDate;
    private String checkInTime;
    private String checkOutTime;
    private String workHours;
    private String status;
}

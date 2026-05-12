package com.Kart.Attendance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Kart.Attendance.Entity.AttendanceDetails;

import java.util.Optional;

@Repository
public interface Attendance_Details extends JpaRepository<AttendanceDetails, Long> {
    Optional<AttendanceDetails> findByUserIdAndTenantIdAndAttendanceDate(String userId, String tenantId, String attendanceDate);
}

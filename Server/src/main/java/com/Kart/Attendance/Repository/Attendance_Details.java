package com.Kart.Attendance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Kart.Attendance.Entity.AttendanceDetails;

import java.util.List;
import java.util.Optional;

@Repository
public interface Attendance_Details extends JpaRepository<AttendanceDetails, Long> {
    Optional<AttendanceDetails> findByUserIdAndTenantIdAndAttendanceDate(String userId, String tenantId, String attendanceDate);
    List<AttendanceDetails> findByUserIdAndTenantIdAndAttendanceDateStartingWith(String userId, String tenantId, String yearMonth);
    List<AttendanceDetails> findByTenantIdAndAttendanceDateStartingWith(String tenantId, String yearMonth);
    long countByTenantIdAndAttendanceDate(String tenantId, String attendanceDate);
    List<AttendanceDetails> findByTenantIdAndAttendanceDate(String tenantId, String attendanceDate);
    void deleteByUserIdAndTenantId(String userId, String tenantId);
}

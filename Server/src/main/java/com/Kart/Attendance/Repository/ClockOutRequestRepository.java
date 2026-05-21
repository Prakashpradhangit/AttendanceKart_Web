package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.ClockOutRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClockOutRequestRepository extends JpaRepository<ClockOutRequest, Long> {
    List<ClockOutRequest> findByTenantId(String tenantId);
    List<ClockOutRequest> findByUserIdAndTenantId(String userId, String tenantId);
    List<ClockOutRequest> findByTenantIdAndStatus(String tenantId, String status);
    Optional<ClockOutRequest> findByUserIdAndTenantIdAndAttendanceDate(String userId, String tenantId, String attendanceDate);
}

package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserIdAndTenantId(String userId, String tenantId);
    List<LeaveRequest> findByUserIdAndTenantIdAndStatus(String userId, String tenantId, String status);
    List<LeaveRequest> findByTenantId(String tenantId);
    long countByTenantIdAndStatus(String tenantId, String status);
    void deleteByUserIdAndTenantId(String userId, String tenantId);
}

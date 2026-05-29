package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.PayslipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayslipRequestRepository extends JpaRepository<PayslipRequest, Long> {
    List<PayslipRequest> findByTenantId(String tenantId);
    List<PayslipRequest> findByTenantIdAndStatus(String tenantId, String status);
    List<PayslipRequest> findByUserIdAndTenantId(Long userId, String tenantId);
}

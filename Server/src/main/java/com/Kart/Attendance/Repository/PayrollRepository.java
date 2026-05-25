package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByTenantId(String tenantId);
    List<Payroll> findByTenantIdAndMonth(String tenantId, String month);
    Optional<Payroll> findByUserIdAndTenantIdAndMonth(Long userId, String tenantId, String month);
    List<Payroll> findByUserIdAndTenantIdAndStatusIn(Long userId, String tenantId, List<String> statuses);
}

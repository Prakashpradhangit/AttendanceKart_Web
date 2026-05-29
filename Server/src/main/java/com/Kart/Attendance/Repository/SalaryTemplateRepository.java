package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.SalaryTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaryTemplateRepository extends JpaRepository<SalaryTemplate, Long> {
    List<SalaryTemplate> findByTenantId(String tenantId);
    List<SalaryTemplate> findByTenantIdAndActive(String tenantId, boolean active);
}

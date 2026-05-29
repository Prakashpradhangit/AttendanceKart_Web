package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    List<SalaryStructure> findByUserIdAndTenantIdOrderByEffectiveDateDesc(Long userId, String tenantId);
    
    // Find active salary structure on or before a given date (for backdated changes or proration support)
    Optional<SalaryStructure> findFirstByUserIdAndTenantIdAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(
            Long userId, String tenantId, LocalDate date);
}

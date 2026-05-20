package com.Kart.Attendance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Kart.Attendance.Entity.Notice;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}

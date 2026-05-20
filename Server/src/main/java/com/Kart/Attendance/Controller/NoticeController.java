package com.Kart.Attendance.Controller;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Notice;
import com.Kart.Attendance.Repository.NoticeRepository;
import com.Kart.Attendance.Service.NoticeSseService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeRepository noticeRepository;
    private final NoticeSseService noticeSseService;

    @GetMapping("/stream")
    public SseEmitter streamNotices(HttpServletRequest request) {
        String role = (String) request.getAttribute("authenticatedRole");
        if (!"ADMIN".equals(role) && !"USER".equals(role)) {
            throw new RuntimeException("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        return noticeSseService.registerEmitter(tenantId);
    }

    @GetMapping
    public ResponseEntity<?> getNotices(HttpServletRequest request) {
        String role = (String) request.getAttribute("authenticatedRole");
        if (!"ADMIN".equals(role) && !"USER".equals(role)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        List<Notice> notices = noticeRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return ResponseEntity.ok(notices);
    }

    @PostMapping
    public ResponseEntity<?> createNotice(HttpServletRequest request, @RequestBody Notice notice) {
        String role = (String) request.getAttribute("authenticatedRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        notice.setTenantId(tenantId);
        notice.setCreatedAt(LocalDateTime.now());
        
        // Get the admin's name from request attributes
        String name = (String) request.getAttribute("authenticatedName");
        if (name == null || name.isBlank()) {
            name = "Admin";
        }
        notice.setCreatedBy(name);

        Notice savedNotice = noticeRepository.save(notice);
        noticeSseService.broadcastNotice(tenantId, savedNotice);
        return ResponseEntity.ok(savedNotice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(HttpServletRequest request, @PathVariable Long id) {
        String role = (String) request.getAttribute("authenticatedRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        
        return noticeRepository.findById(id).map(notice -> {
            // Ensure notice belongs to the same tenant
            if (!notice.getTenantId().equals(TenantContext.getCurrentTenant())) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            noticeRepository.delete(notice);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

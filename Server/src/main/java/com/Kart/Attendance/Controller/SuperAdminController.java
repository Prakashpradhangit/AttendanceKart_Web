package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.AdminResponseDTO;
import com.Kart.Attendance.Service.SuperAdminService;
import com.Kart.Attendance.Config.TenantContext;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        if (!"SYSTEM_SUPER_ADMIN".equals(TenantContext.getCurrentTenant())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        List<AdminResponseDTO> stats = superAdminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}

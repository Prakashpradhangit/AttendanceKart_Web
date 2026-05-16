package com.Kart.Attendance.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Service.AdminService;

import lombok.RequiredArgsConstructor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/api/admin/settings")
    public ResponseEntity<?> getSettings(HttpServletRequest request) {
        String role = (String) request.getAttribute("authenticatedRole");
        if (!"ADMIN".equals(role) && !"USER".equals(role)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(adminService.getAdminByTenantId(tenantId));
    }

    @PutMapping("/api/admin/settings")
    public ResponseEntity<?> updateSettings(HttpServletRequest request, @RequestBody java.util.Map<String, Object> settings) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(adminService.updateSettings(tenantId, settings));
    }

    @GetMapping("/api/admin")
    public ResponseEntity<?> getAllAdmin() {
        if (!"SYSTEM_SUPER_ADMIN".equals(TenantContext.getCurrentTenant())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        return ResponseEntity.ok(adminService.getAllAdmin());
    }

    @PostMapping("/api/admin")
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin) {
        if (!"SYSTEM_SUPER_ADMIN".equals(com.Kart.Attendance.Config.TenantContext.getCurrentTenant())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        return ResponseEntity.ok(adminService.createNewAdmin(admin));
    }

    @PutMapping("/api/admin/{id}")
    public ResponseEntity<?> updateAdmin(@org.springframework.web.bind.annotation.PathVariable Long id, @RequestBody Admin adminDetails) {
        if (!"SYSTEM_SUPER_ADMIN".equals(com.Kart.Attendance.Config.TenantContext.getCurrentTenant())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        return ResponseEntity.ok(adminService.updateAdmin(id, adminDetails));
    }

    

    @DeleteMapping("/api/admin/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        if (!"SYSTEM_SUPER_ADMIN".equals(TenantContext.getCurrentTenant())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        adminService.deleteAdmin(id);
        return ResponseEntity.ok().build();
    }
}

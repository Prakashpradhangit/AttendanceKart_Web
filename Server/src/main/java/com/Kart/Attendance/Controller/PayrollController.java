package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Payroll;
import com.Kart.Attendance.Entity.PayslipRequest;
import com.Kart.Attendance.Service.PayrollService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {
    private final PayrollService payrollService;

    // SALARY STRUCTURE CONFIGURATION ENDPOINTS
    @GetMapping("/salary-structure/{userId}")
    public ResponseEntity<?> getSalaryStructures(HttpServletRequest request, @PathVariable Long userId) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getSalaryStructures(userId, tenantId));
    }

    @PostMapping("/salary-structure")
    public ResponseEntity<?> saveSalaryStructure(HttpServletRequest request, @RequestBody com.Kart.Attendance.Entity.SalaryStructure structure) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.saveSalaryStructure(structure, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // SALARY BLUEPRINT TEMPLATE ENDPOINTS
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getTemplates(tenantId));
    }

    @PostMapping("/templates")
    public ResponseEntity<?> saveTemplate(HttpServletRequest request, @RequestBody com.Kart.Attendance.Entity.SalaryTemplate template) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.saveTemplate(template, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(HttpServletRequest request, @PathVariable Long id) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            payrollService.deleteTemplate(id, tenantId);
            return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/templates/{id}/assign")
    public ResponseEntity<?> assignTemplate(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            List<?> uIdsRaw = (List<?>) body.get("userIds");
            List<Long> userIds = new ArrayList<>();
            for (Object o : uIdsRaw) {
                if (o instanceof Number) userIds.add(((Number) o).longValue());
                else if (o instanceof String) userIds.add(Long.parseLong((String) o));
            }
            
            String effDateStr = (String) body.get("effectiveDate");
            LocalDate effectiveDate = (effDateStr != null) ? LocalDate.parse(effDateStr) : LocalDate.now();

            payrollService.assignTemplateToEmployees(id, userIds, effectiveDate, tenantId);
            return ResponseEntity.ok(Map.of("message", "Template assigned successfully to selected employees"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> saveBulkPayroll(HttpServletRequest request, @RequestBody List<Payroll> payrolls) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            List<Payroll> saved = new ArrayList<>();
            for (Payroll p : payrolls) {
                saved.add(payrollService.savePayroll(p, tenantId));
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ADMIN ENDPOINTS
    @GetMapping("/employees")
    public ResponseEntity<?> getActiveEmployees(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getActiveEmployees(tenantId));
    }

    @GetMapping("/calculate")
    public ResponseEntity<?> calculateSuggestion(
            HttpServletRequest request,
            @RequestParam Long userId,
            @RequestParam String month
    ) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.calculateSuggestion(userId, month, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> savePayroll(HttpServletRequest request, @RequestBody Payroll payroll) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.savePayroll(payroll, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayroll(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Payroll payroll
    ) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.updatePayroll(id, payroll, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String transactionId
    ) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            return ResponseEntity.ok(payrollService.updateStatus(id, status, method, transactionId, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPayrolls(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getAllPayrolls(tenantId));
    }

    @GetMapping("/admin/requests")
    public ResponseEntity<?> getPendingRequests(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getPendingRequests(tenantId));
    }

    // Payslip preview (HTML) for admin
    @GetMapping(value = "/payslip/{requestId}/preview", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> previewPayslip(@PathVariable Long requestId, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        String tenantId = TenantContext.getCurrentTenant();
        try {
            String html = payrollService.generatePayslipHtml(requestId, tenantId);
            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Payslip download as PDF file
    @GetMapping(value = "/payslip/{payrollId}/download", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payrollId, HttpServletRequest request) {
        String tenantId = TenantContext.getCurrentTenant();
        boolean isAdmin = isAdmin(request);
        Long authenticatedUserId = (Long) request.getAttribute("authenticatedUserId");

        try {
            byte[] pdfBytes = payrollService.getPayslipFileForDownload(payrollId, tenantId, authenticatedUserId, isAdmin);
            String filename = "payslip_" + payrollId + ".pdf";
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
    }

    // EMPLOYEE (USER) ENDPOINTS
    @GetMapping("/my")
    public ResponseEntity<?> getMyPayrolls(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getEmployeePayrolls(userId, tenantId));
    }

    @PostMapping("/my/requests")
    public ResponseEntity<?> createMyRequest(
            HttpServletRequest request,
            @RequestBody Map<String, String> body
    ) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        String tenantId = TenantContext.getCurrentTenant();
        
        String month = body.get("month");
        String reason = body.get("reason");
        if (month == null || month.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Month is required"));
        }

        try {
            return ResponseEntity.ok(payrollService.createRequest(userId, month, reason, tenantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my/requests")
    public ResponseEntity<?> getMyRequests(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(payrollService.getEmployeeRequests(userId, tenantId));
    }

    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("authenticatedRole");
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }
}

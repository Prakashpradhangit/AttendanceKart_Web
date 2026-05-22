package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/today")
    public ResponseEntity<?> getTodayAttendance(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        Optional<AttendanceDetails> attendance = attendanceService.getTodayAttendance(userId);
        if (attendance.isPresent()) {
            AttendanceDetails att = attendance.get();
            boolean earlyCheckOut = attendanceService.isEarlyCheckOut(att);
            Map<String, Object> response = new HashMap<>();
            response.put("id", att.getId());
            response.put("tenantId", att.getTenantId());
            response.put("userId", att.getUserId());
            response.put("userName", att.getUserName());
            response.put("department", att.getDepartment());
            response.put("designation", att.getDesignation());
            response.put("attendanceDate", att.getAttendanceDate());
            response.put("checkInTime", att.getCheckInTime());
            response.put("checkOutTime", att.getCheckOutTime());
            response.put("workHours", att.getWorkHours());
            response.put("status", att.getStatus());
            response.put("earlyCheckOut", earlyCheckOut);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(null);
    }

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        try {
            AttendanceDetails attendance = attendanceService.clockIn(userId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        try {
            AttendanceDetails att = attendanceService.clockOut(userId);
            boolean earlyCheckOut = attendanceService.isEarlyCheckOut(att);
            Map<String, Object> response = new HashMap<>();
            response.put("id", att.getId());
            response.put("tenantId", att.getTenantId());
            response.put("userId", att.getUserId());
            response.put("userName", att.getUserName());
            response.put("department", att.getDepartment());
            response.put("designation", att.getDesignation());
            response.put("attendanceDate", att.getAttendanceDate());
            response.put("checkInTime", att.getCheckInTime());
            response.put("checkOutTime", att.getCheckOutTime());
            response.put("workHours", att.getWorkHours());
            response.put("status", att.getStatus());
            response.put("earlyCheckOut", earlyCheckOut);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/missing-clock-outs")
    public ResponseEntity<?> getMissingClockOuts(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        try {
            return ResponseEntity.ok(attendanceService.getMissingClockOuts(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyAttendance(HttpServletRequest request, @RequestParam String month) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        java.util.List<AttendanceDetails> attendance = attendanceService.getMonthlyAttendance(userId, month);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/admin/today/count")
    public ResponseEntity<?> getTodayPresentCount(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(Map.of("count", attendanceService.getTodayPresentCount()));
    }

    @GetMapping("/admin/trends")
    public ResponseEntity<?> getTrends(
            @RequestParam(required = false) String month,
            HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(attendanceService.getAttendanceTrends(month));
    }

    @GetMapping("/admin/today/all")
    public ResponseEntity<?> getAllTodayAttendance(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(attendanceService.getAllTodayAttendance());
    }

    @GetMapping("/admin/today/stats")
    public ResponseEntity<?> getTodayStats(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(attendanceService.getTodayStats());
    }

    @GetMapping("/admin/stats/7days")
    public ResponseEntity<?> get7DayTrends(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(attendanceService.get7DayTrends());
    }
}

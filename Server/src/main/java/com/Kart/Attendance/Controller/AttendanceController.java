package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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
        return ResponseEntity.ok(attendance.orElse(null));
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
            AttendanceDetails attendance = attendanceService.clockOut(userId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
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
}

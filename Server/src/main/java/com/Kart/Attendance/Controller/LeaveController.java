package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<?> applyLeave(HttpServletRequest request, @RequestBody LeaveRequest leaveRequest) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(leaveService.applyLeave(leaveRequest, userId));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getLeaveCount(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(Map.of("count", leaveService.getApprovedLeaveCount(userId)));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllLeaves(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/admin/pending/count")
    public ResponseEntity<?> getPendingCount(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(Map.of("count", leaveService.getPendingLeaveCount()));
    }
}

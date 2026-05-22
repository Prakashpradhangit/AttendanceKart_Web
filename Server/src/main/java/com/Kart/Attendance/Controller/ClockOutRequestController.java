package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.ClockOutRequest;
import com.Kart.Attendance.Service.ClockOutRequestService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance/clock-out-requests")
@RequiredArgsConstructor
public class ClockOutRequestController {

    private final ClockOutRequestService requestService;

    @PostMapping
    public ResponseEntity<?> createRequest(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload
    ) {
        try {
            if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            Long userId = (Long) request.getAttribute("authenticatedUserId");
            String date = payload.get("date");
            String checkInTime = payload.get("checkInTime");
            String checkOutTime = payload.get("checkOutTime");
            if (checkOutTime == null) {
                checkOutTime = payload.get("time");
            }
            String note = payload.get("note");

            if (date == null || checkOutTime == null || date.isEmpty() || checkOutTime.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Date and clock-out time are required"));
            }

            ClockOutRequest newRequest = requestService.createRequest(userId, date, checkInTime, checkOutTime, note);
            return ResponseEntity.ok(newRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAllRequestsForAdmin(HttpServletRequest request) {
        try {
            if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            return ResponseEntity.ok(requestService.getAllRequestsForAdmin());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyRequests(HttpServletRequest request) {
        try {
            if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            Long userId = (Long) request.getAttribute("authenticatedUserId");
            return ResponseEntity.ok(requestService.getMyRequests(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            if (!"ADMIN".equals(request.getAttribute("authenticatedRole"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            ClockOutRequest updated = requestService.updateRequestStatus(id, status.toUpperCase());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

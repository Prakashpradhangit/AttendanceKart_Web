package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, String> response = authService.login(email, password);

        if (response != null) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }

        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/session")
    public ResponseEntity<?> session(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }

        Map<String, String> session = authService.getSession(token);
        if (session == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        return ResponseEntity.ok(session);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }

        Map<String, Object> profile = authService.getProfile(token);
        if (profile == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody Map<String, Object> updates) {
        String token = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }

        if (updates != null) {
            updates.remove("email");
            updates.remove("employeeCode");
            updates.remove("employeeId");
            updates.remove("id");
            updates.remove("role");
            updates.remove("tenantId");
        }

        Map<String, Object> updatedProfile = authService.updateProfile(token, updates);
        if (updatedProfile == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session or unauthorized"));
        }

        return ResponseEntity.ok(updatedProfile);
    }
}

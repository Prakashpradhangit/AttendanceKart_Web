package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import com.Kart.Attendance.Service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        if (!isAdminRequest(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getUserDashboardDetails(HttpServletRequest request) {
        if (!"USER".equals(request.getAttribute("authenticatedRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(userService.getDashboardDetails(userId));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, HttpServletRequest request) {
        if (!isAdminRequest(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkCreateUsers(@RequestBody List<User> users, HttpServletRequest request) {
        if (!isAdminRequest(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(userService.bulkCreateUsers(users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user, HttpServletRequest request) {
        if (!isAdminRequest(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminRequest(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    private boolean isAdminRequest(HttpServletRequest request) {
        String role = (String) request.getAttribute("authenticatedRole");
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }
}

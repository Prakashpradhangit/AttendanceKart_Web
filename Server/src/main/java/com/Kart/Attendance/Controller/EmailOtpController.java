package com.Kart.Attendance.Controller;

import com.Kart.Attendance.Service.EmailOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/email-otp")
@RequiredArgsConstructor
public class EmailOtpController {
    private final EmailOtpService emailOtpService;

    @PostMapping("/request")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        emailOtpService.sendOtp(payload.get("email"), payload.get("purpose"));
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(emailOtpService.verifyOtp(
                payload.get("email"),
                payload.get("purpose"),
                payload.get("otp")
        ));
    }
}

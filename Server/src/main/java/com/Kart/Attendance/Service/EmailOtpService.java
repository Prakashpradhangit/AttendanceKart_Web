package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.EmailOtp;
import com.Kart.Attendance.Repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailOtpService {
    public static final String PURPOSE_EMPLOYEE_REGISTRATION = "EMPLOYEE_REGISTRATION";
    public static final String PURPOSE_ADMIN_REGISTRATION = "ADMIN_REGISTRATION";

    private static final int OTP_TTL_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpRepository emailOtpRepository;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.email.from}")
    private String fromEmail;

    @Transactional
    public void sendOtp(String email, String purpose) {
        String normalizedEmail = normalizeEmail(email);
        validatePurpose(purpose);

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        EmailOtp otp = new EmailOtp();
        otp.setEmail(normalizedEmail);
        otp.setPurpose(purpose);
        otp.setCodeHash(hash(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES));
        emailOtpRepository.save(otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(normalizedEmail);
        message.setSubject("AttendanceKart email verification OTP");
        message.setText("Thank you for using AttendanceKart.\n" + //
                        "\n" + //
                        "To complete your profile verification process, please use the following One-Time Password (OTP):\n" + code
                        +"\n"+
                        "This OTP is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.\n" + //
                        "\n" + //
                        "If you did not request this verification, please ignore this email. " +". It expires in " + OTP_TTL_MINUTES + " minutes.");
        mailSender.send(message);
    }

    @Transactional
    public Map<String, String> verifyOtp(String email, String purpose, String code) {
        String normalizedEmail = normalizeEmail(email);
        validatePurpose(purpose);

        EmailOtp otp = emailOtpRepository.findTopByEmailAndPurposeAndConsumedFalseOrderByCreatedAtDesc(normalizedEmail, purpose)
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new OTP."));

        if (otp.isVerified()) {
            return Map.of("verificationToken", otp.getVerificationToken());
        }

        if (otp.getExpiresAt() == null || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new OTP.");
        }

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new RuntimeException("Too many invalid OTP attempts. Please request a new OTP.");
        }

        otp.setAttempts(otp.getAttempts() + 1);
        if (!hash(code).equals(otp.getCodeHash())) {
            emailOtpRepository.save(otp);
            throw new RuntimeException("Invalid OTP.");
        }

        otp.setVerified(true);
        otp.setVerificationToken(UUID.randomUUID().toString());
        emailOtpRepository.save(otp);
        return Map.of("verificationToken", otp.getVerificationToken());
    }

    @Transactional
    public void consumeVerification(String email, String purpose, String verificationToken) {
        String normalizedEmail = normalizeEmail(email);
        validatePurpose(purpose);

        EmailOtp otp = emailOtpRepository
                .findByVerificationTokenAndEmailAndPurposeAndVerifiedTrueAndConsumedFalse(verificationToken, normalizedEmail, purpose)
                .orElseThrow(() -> new RuntimeException("Email verification is required."));

        if (otp.getExpiresAt() == null || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Email verification expired. Please verify again.");
        }

        otp.setConsumed(true);
        emailOtpRepository.save(otp);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required.");
        }
        return email.trim().toLowerCase();
    }

    private void validatePurpose(String purpose) {
        if (!PURPOSE_EMPLOYEE_REGISTRATION.equals(purpose) && !PURPOSE_ADMIN_REGISTRATION.equals(purpose)) {
            throw new RuntimeException("Invalid OTP purpose.");
        }
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Unable to hash OTP.");
        }
    }
}

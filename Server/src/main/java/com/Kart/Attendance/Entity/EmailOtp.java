package com.Kart.Attendance.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "email_otps", indexes = {
    @Index(name = "idx_email_otp_email_purpose", columnList = "email, purpose"),
    @Index(name = "idx_email_otp_token", columnList = "verificationToken")
})
public class EmailOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String purpose;

    @Column(nullable = false)
    private String codeHash;

    private String verificationToken;
    private int attempts = 0;
    private boolean verified = false;
    private boolean consumed = false;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt = LocalDateTime.now();
}

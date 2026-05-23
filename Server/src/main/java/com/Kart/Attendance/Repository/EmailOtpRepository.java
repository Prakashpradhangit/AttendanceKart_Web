package com.Kart.Attendance.Repository;

import com.Kart.Attendance.Entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findTopByEmailAndPurposeAndConsumedFalseOrderByCreatedAtDesc(String email, String purpose);
    Optional<EmailOtp> findByVerificationTokenAndEmailAndPurposeAndVerifiedTrueAndConsumedFalse(String verificationToken, String email, String purpose);
}

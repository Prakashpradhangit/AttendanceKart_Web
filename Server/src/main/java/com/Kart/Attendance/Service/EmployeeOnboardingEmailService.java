package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeOnboardingEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    public void sendCredentials(User user, String plainPassword, String organizationName) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Unable to send onboarding email: employee email missing.");
        }
        if (plainPassword == null || plainPassword.isBlank()) {
            throw new RuntimeException("Unable to send onboarding email: employee password missing.");
        }

        String orgLabel = (organizationName == null || organizationName.isBlank()) ? "AttendanceKart" : organizationName;
        String empCode = user.getEmployeeCode() != null ? user.getEmployeeCode() : "N/A";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail().trim().toLowerCase());
        message.setSubject("Your AttendanceKart account is ready");
        message.setText(
                "Dear User,\n" + //
                "Welcome to AttendanceKart.\n" + //
                "\n" + //
                "Your account has been successfully created." + orgLabel + "!\n\n" +
                "Your employee account has been created.\n\n" +
                "Login Email: " + user.getEmail().trim().toLowerCase() + "\n" +
                "Password: " + plainPassword + "\n" +
                "Employee Code: " + empCode + "\n\n" +
                "You can now log in and access your AttendanceKart dashboard.\n" + //
                "\n" + //
                "For security reasons, we recommend changing your password after your first login."
        );
        mailSender.send(message);
    }
}

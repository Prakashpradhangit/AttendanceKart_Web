package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final Attendance_Details attendanceRepository;
    private final UserRepository userRepository;

    public Optional<AttendanceDetails> getTodayAttendance(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();
        return attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, today);
    }

    public AttendanceDetails clockIn(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();

        Optional<AttendanceDetails> existingRecord = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, today);

        if (existingRecord.isPresent()) {
            throw new RuntimeException("Already clocked in today");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        AttendanceDetails attendance = new AttendanceDetails();
        attendance.setTenantId(tenantId);
        attendance.setUserId(String.valueOf(userId));
        attendance.setUserName(user.getName());
        attendance.setDepartment(user.getDepartment());
        attendance.setDesignation(user.getDesignation());
        attendance.setAttendanceDate(today);
        attendance.setCheckInTime(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        attendance.setStatus("PRESENT");

        return attendanceRepository.save(attendance);
    }

    public AttendanceDetails clockOut(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();

        AttendanceDetails attendance = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, today)
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already clocked out today");
        }

        LocalDateTime checkInTime = LocalDateTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        LocalDateTime checkOutTime = LocalDateTime.now();

        attendance.setCheckOutTime(checkOutTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        Duration duration = Duration.between(checkInTime, checkOutTime);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        
        attendance.setWorkHours(String.format("%02d:%02d", hours, minutes));

        return attendanceRepository.save(attendance);
    }

    public java.util.List<AttendanceDetails> getMonthlyAttendance(Long userId, String yearMonth) {
        String tenantId = TenantContext.getCurrentTenant();
        return attendanceRepository.findByUserIdAndTenantIdAndAttendanceDateStartingWith(String.valueOf(userId), tenantId, yearMonth);
    }
}

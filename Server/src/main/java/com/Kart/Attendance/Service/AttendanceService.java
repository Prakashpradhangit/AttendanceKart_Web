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
import java.util.*;
import java.util.stream.Collectors;
import com.Kart.Attendance.Entity.LeaveRequest;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final Attendance_Details attendanceRepository;
    private final UserRepository userRepository;
    private final com.Kart.Attendance.Repository.LeaveRepository leaveRepository;

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

    public long getTodayPresentCount() {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();
        return attendanceRepository.countByTenantIdAndAttendanceDate(tenantId, today);
    }

    public List<Map<String, Object>> getAttendanceTrends(String monthStr) {
        String tenantId = TenantContext.getCurrentTenant();
        LocalDate now = LocalDate.now();
        
        LocalDate firstDay;
        int daysInMonth;
        String queryYearMonth;

        if (monthStr != null && !monthStr.isBlank()) {
            // Assume format "YYYY-MM"
            String[] parts = monthStr.split("-");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            firstDay = LocalDate.of(year, month, 1);
            daysInMonth = firstDay.lengthOfMonth();
            queryYearMonth = monthStr;
        } else {
            firstDay = now.withDayOfMonth(1);
            daysInMonth = now.lengthOfMonth();
            queryYearMonth = now.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        // Fetch all attendance for the month
        List<AttendanceDetails> attendanceList = attendanceRepository.findByTenantIdAndAttendanceDateStartingWith(tenantId, queryYearMonth);
        
        // Fetch all approved leaves for the tenant
        List<LeaveRequest> leaveList = leaveRepository.findByTenantId(tenantId).stream()
                .filter(l -> "APPROVED".equals(l.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> trends = new ArrayList<>();
        
        // Loop through all days of the selected month
        for (int i = 1; i <= daysInMonth; i++) {
            LocalDate date = firstDay.withDayOfMonth(i);
            String dateStr = date.toString();
            String label = date.format(DateTimeFormatter.ofPattern("dd MMM"));

            long presentCount = attendanceList.stream()
                    .filter(a -> dateStr.equals(a.getAttendanceDate()))
                    .count();

            long leaveCount = leaveList.stream()
                    .filter(l -> {
                        try {
                            LocalDate start = LocalDate.parse(l.getFromDate());
                            LocalDate end = LocalDate.parse(l.getToDate());
                            return !date.isBefore(start) && !date.isAfter(end);
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .count();

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("name", label);
            dayData.put("present", presentCount);
            dayData.put("onLeave", leaveCount);
            trends.add(dayData);
        }

        return trends;
    }
}

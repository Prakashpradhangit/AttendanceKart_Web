package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final com.Kart.Attendance.Repository.AdminRepository adminRepository;

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
        
        // Calculate status based on settings
        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
        String checkInTimeStr = (admin != null) ? admin.getDefaultCheckInTime() : "09:00";
        int gracePeriod = (admin != null) ? admin.getGracePeriod() : 15;
        
        LocalTime baseTime = LocalTime.parse(checkInTimeStr);
        LocalTime thresholdTime = baseTime.plusMinutes(gracePeriod);
        LocalTime nowTime = LocalTime.now();
        
        if (nowTime.isAfter(thresholdTime)) {
            attendance.setStatus("Late");
        } else {
            attendance.setStatus("Present");
        }

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

        List<AttendanceDetails> attendanceList = attendanceRepository.findByTenantIdAndAttendanceDateStartingWith(tenantId, queryYearMonth);
        List<LeaveRequest> leaveList = leaveRepository.findByTenantId(tenantId).stream()
                .filter(l -> "APPROVED".equals(l.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> trends = new ArrayList<>();
        for (int i = 1; i <= daysInMonth; i++) {
            LocalDate date = firstDay.withDayOfMonth(i);
            String dateStr = date.toString();
            String label = String.valueOf(i);

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
            dayData.put("leave", leaveCount);
            dayData.put("absent", Math.max(0, userRepository.countByTenantIdAndRole(tenantId, com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE) - presentCount - leaveCount));
            trends.add(dayData);
        }
        return trends;
    }

    public Map<String, Object> getTodayStats() {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();

        long totalEmployees = userRepository.countByTenantIdAndRole(tenantId, com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE);
        List<AttendanceDetails> todayAttendance = attendanceRepository.findByTenantIdAndAttendanceDate(tenantId, today);
        long presentToday = todayAttendance.size();

        Admin admin = adminRepository.findByTenantId(tenantId)
                .orElse(null);
        
        String checkInTimeStr = (admin != null) ? admin.getDefaultCheckInTime() : "09:00";
        int gracePeriod = (admin != null) ? admin.getGracePeriod() : 15;

        LocalTime baseTime = LocalTime.parse(checkInTimeStr);
        LocalTime thresholdTime = baseTime.plusMinutes(gracePeriod);

        long lateArrivals = todayAttendance.stream()
                .filter(a -> {
                    try {
                        LocalTime checkInTime = LocalDateTime.parse(a.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME).toLocalTime();
                        return checkInTime.isAfter(thresholdTime);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();

        long onLeaveToday = leaveRepository.findByTenantId(tenantId).stream()
                .filter(l -> "APPROVED".equals(l.getStatus()))
                .filter(l -> {
                    try {
                        LocalDate start = LocalDate.parse(l.getFromDate());
                        LocalDate end = LocalDate.parse(l.getToDate());
                        LocalDate now = LocalDate.now();
                        return !now.isBefore(start) && !now.isAfter(end);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();

        long absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("presentToday", presentToday);
        stats.put("absentToday", absentToday);
        stats.put("lateArrivals", lateArrivals);
        stats.put("onLeaveToday", onLeaveToday);
        stats.put("onTimeToday", Math.max(0, presentToday - lateArrivals));
        return stats;
    }

    public List<Map<String, Object>> get7DayTrends() {
        String tenantId = TenantContext.getCurrentTenant();
        List<Map<String, Object>> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();

        long totalEmployees = userRepository.countByTenantIdAndRole(tenantId, com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE);
        List<LeaveRequest> allLeaves = leaveRepository.findByTenantId(tenantId).stream()
                .filter(l -> "APPROVED".equals(l.getStatus()))
                .collect(Collectors.toList());

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.toString();
            String label = date.format(DateTimeFormatter.ofPattern("dd MMM"));

            long presentCount = attendanceRepository.countByTenantIdAndAttendanceDate(tenantId, dateStr);
            long leaveCount = allLeaves.stream()
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
            
            long absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("name", label);
            dayData.put("present", presentCount);
            dayData.put("absent", absentCount);
            dayData.put("leave", leaveCount);
            trends.add(dayData);
        }
        return trends;
    }

    public List<AttendanceDetails> getAllTodayAttendance() {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();
        return attendanceRepository.findByTenantIdAndAttendanceDate(tenantId, today);
    }
}

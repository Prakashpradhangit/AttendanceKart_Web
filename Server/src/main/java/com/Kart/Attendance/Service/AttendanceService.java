package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Entity.ClockOutRequest;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.UserRepository;
import com.Kart.Attendance.Repository.LeaveRepository;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.ClockOutRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final Attendance_Details attendanceRepository;
    private final UserRepository userRepository;
    private final LeaveRepository leaveRepository;
    private final AdminRepository adminRepository;
    private final ClockOutRequestRepository requestRepository;

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
            attendance.setStatus("On Time");
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
        List<LeaveRequest> leaveList = leaveRepository.findByTenantIdAndStatus(tenantId, "APPROVED");
        long totalEmployees = userRepository.countByTenantIdAndRole(tenantId, com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE);

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
            dayData.put("absent", Math.max(0, totalEmployees - presentCount - leaveCount));
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

        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);

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

        long onLeaveToday = leaveRepository.findByTenantIdAndStatus(tenantId, "APPROVED").stream()
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
        List<LeaveRequest> allLeaves = leaveRepository.findByTenantIdAndStatus(tenantId, "APPROVED");
        LocalDate startDate = today.minusDays(6);
        Map<String, Long> presentCountsByDate = attendanceRepository
                .findByTenantIdAndAttendanceDateBetween(tenantId, startDate.toString(), today.toString())
                .stream()
                .collect(Collectors.groupingBy(AttendanceDetails::getAttendanceDate, Collectors.counting()));

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.toString();
            String label = date.format(DateTimeFormatter.ofPattern("dd MMM"));

            long presentCount = presentCountsByDate.getOrDefault(dateStr, 0L);
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

    public List<AttendanceDetails> getAllAttendanceByDate(String date) {
        String tenantId = TenantContext.getCurrentTenant();
        String targetDate = (date != null && !date.isBlank()) ? date : LocalDate.now().toString();
        return attendanceRepository.findByTenantIdAndAttendanceDate(tenantId, targetDate);
    }

    public List<AttendanceDetails> getMissingClockOuts(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        String today = LocalDate.now().toString();

        List<AttendanceDetails> nullCheckOuts = attendanceRepository.findByUserIdAndTenantIdAndCheckOutTimeIsNull(String.valueOf(userId), tenantId);

        List<AttendanceDetails> pastMissing = nullCheckOuts.stream()
                .filter(a -> a.getAttendanceDate().compareTo(today) < 0)
                .collect(Collectors.toList());

        List<ClockOutRequest> requests = requestRepository.findByUserIdAndTenantId(String.valueOf(userId), tenantId);
        Set<String> requestedDates = requests.stream()
                .filter(r -> "PENDING".equals(r.getStatus()) || "APPROVED".equals(r.getStatus()))
                .map(ClockOutRequest::getAttendanceDate)
                .collect(Collectors.toSet());

        return pastMissing.stream()
                .filter(a -> !requestedDates.contains(a.getAttendanceDate()))
                .collect(Collectors.toList());
    }

    public boolean isEarlyCheckOut(AttendanceDetails attendance) {
        if (attendance.getCheckInTime() == null || attendance.getCheckOutTime() == null) {
            return false;
        }
        String tenantId = attendance.getTenantId();
        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
        if (admin == null) {
            return false;
        }

        try {
            LocalDateTime checkInDateTime = LocalDateTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            LocalDateTime checkOutDateTime = LocalDateTime.parse(attendance.getCheckOutTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            // 1. Check if checkout time is before expectedCheckOutTime
            LocalTime checkOutTime = checkOutDateTime.toLocalTime();
            LocalTime expectedCheckOutTime = LocalTime.parse(admin.getDefaultCheckOutTime());
            if (checkOutTime.isBefore(expectedCheckOutTime)) {
                return true;
            }

            // 2. Check if actual work duration is less than shiftDuration (hours)
            double requiredHours = admin.getShiftDuration();
            Duration actualDuration = Duration.between(checkInDateTime, checkOutDateTime);
            double actualWorkHours = actualDuration.toMinutes() / 60.0;
            if (actualWorkHours < requiredHours) {
                return true;
            }
        } catch (Exception e) {
            // ignore
        }
        return false;
    }
}

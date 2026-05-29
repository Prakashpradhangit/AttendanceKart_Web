package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.ClockOutRequest;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.ClockOutRequestRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClockOutRequestService {

    private final ClockOutRequestRepository requestRepository;
    private final Attendance_Details attendanceRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    public ClockOutRequest createRequest(Long userId, String date, String checkInTime, String checkOutTime, String note) {
        String tenantId = TenantContext.getCurrentTenant();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Check if attendance exists for that date
        Optional<AttendanceDetails> attendance = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, date);
        if (attendance.isPresent() && attendance.get().getCheckOutTime() != null) {
            throw new RuntimeException("You have already clocked out on this date.");
        }

        // Check if a pending request already exists
        Optional<ClockOutRequest> existing = requestRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, date);
        if (existing.isPresent() && "PENDING".equals(existing.get().getStatus())) {
            throw new RuntimeException("A pending clock-out request already exists for this date.");
        }

        ClockOutRequest request = new ClockOutRequest();
        request.setTenantId(tenantId);
        request.setUserId(String.valueOf(userId));
        request.setEmployeeName(user.getName());
        request.setAttendanceDate(date);
        
        request.setRequestedCheckInTime(checkInTime);
        request.setRequestedCheckOutTime(checkOutTime);
        request.setNote(note);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return requestRepository.save(request);
    }

    public List<ClockOutRequest> getAllRequestsForAdmin() {
        String tenantId = TenantContext.getCurrentTenant();
        return requestRepository.findByTenantId(tenantId);
    }

    public List<ClockOutRequest> getMyRequests(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requestRepository.findByUserIdAndTenantId(String.valueOf(userId), tenantId);
    }

    public ClockOutRequest updateRequestStatus(Long requestId, String status) {
        String tenantId = TenantContext.getCurrentTenant();
        ClockOutRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!tenantId.equals(request.getTenantId())) {
            throw new RuntimeException("Unauthorized");
        }

        if ("APPROVED".equals(status) && "PENDING".equals(request.getStatus())) {
            // Apply the clock-out and clock-in
            Optional<AttendanceDetails> attendanceOpt = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(
                    request.getUserId(), tenantId, request.getAttendanceDate()
            );

            AttendanceDetails attendance;
            if (attendanceOpt.isPresent()) {
                attendance = attendanceOpt.get();
            } else {
                User user = userRepository.findById(Long.parseLong(request.getUserId()))
                        .orElseThrow(() -> new RuntimeException("User not found"));
                attendance = new AttendanceDetails();
                attendance.setTenantId(tenantId);
                attendance.setUserId(request.getUserId());
                attendance.setUserName(user.getName());
                attendance.setDepartment(user.getDepartment());
                attendance.setDesignation(user.getDesignation());
                attendance.setAttendanceDate(request.getAttendanceDate());
            }

            LocalDateTime checkInDateTime;
            String reqCheckIn = request.getRequestedCheckInTime();
            if (reqCheckIn == null || reqCheckIn.isEmpty()) {
                if (attendance.getCheckInTime() != null) {
                    checkInDateTime = LocalDateTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } else {
                    Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
                    String defaultIn = (admin != null) ? admin.getDefaultCheckInTime() : "09:00";
                    LocalTime time = LocalTime.parse(defaultIn);
                    checkInDateTime = LocalDateTime.of(LocalDate.parse(request.getAttendanceDate()), time);
                }
            } else {
                try {
                    if (reqCheckIn.contains("T")) {
                        checkInDateTime = LocalDateTime.parse(reqCheckIn, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    } else {
                        LocalTime time = LocalTime.parse(reqCheckIn);
                        checkInDateTime = LocalDateTime.of(LocalDate.parse(request.getAttendanceDate()), time);
                    }
                } catch (Exception e) {
                    checkInDateTime = LocalDateTime.of(LocalDate.parse(request.getAttendanceDate()), LocalTime.of(9, 0));
                }
            }

            LocalDateTime checkOutDateTime;
            String reqCheckOut = request.getRequestedCheckOutTime();
            try {
                if (reqCheckOut.contains("T")) {
                    checkOutDateTime = LocalDateTime.parse(reqCheckOut, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } else {
                    LocalTime time = LocalTime.parse(reqCheckOut);
                    checkOutDateTime = LocalDateTime.of(LocalDate.parse(request.getAttendanceDate()), time);
                }
            } catch (Exception e) {
                checkOutDateTime = LocalDateTime.now();
            }

            // Ensure checkOutDateTime is after checkInDateTime
            if (checkOutDateTime.isBefore(checkInDateTime)) {
                checkOutDateTime = checkOutDateTime.plusDays(1);
            }

            attendance.setCheckInTime(checkInDateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            attendance.setCheckOutTime(checkOutDateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            Duration duration = Duration.between(checkInDateTime, checkOutDateTime);
            long hours = duration.toHours();
            long minutes = duration.toMinutesPart();
            attendance.setWorkHours(String.format("%02d:%02d", hours, minutes));

            // Set/update status (e.g. Present/Late)
            Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
            String defaultIn = (admin != null) ? admin.getDefaultCheckInTime() : "09:00";
            int gracePeriod = (admin != null) ? admin.getGracePeriod() : 15;
            LocalTime baseTime = LocalTime.parse(defaultIn);
            LocalTime thresholdTime = baseTime.plusMinutes(gracePeriod);
            if (checkInDateTime.toLocalTime().isAfter(thresholdTime)) {
                attendance.setStatus("Late");
            } else {
                attendance.setStatus("On Time");
            }

            attendanceRepository.save(attendance);
        }

        request.setStatus(status);
        return requestRepository.save(request);
    }
}

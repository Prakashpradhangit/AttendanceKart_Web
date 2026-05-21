package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.ClockOutRequest;
import com.Kart.Attendance.Entity.User;
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

    public ClockOutRequest createRequest(Long userId, String date, String time, String note) {
        String tenantId = TenantContext.getCurrentTenant();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Check if attendance exists for that date
        Optional<AttendanceDetails> attendance = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(String.valueOf(userId), tenantId, date);
        if (attendance.isEmpty()) {
            throw new RuntimeException("No check-in record found for this date. You must check in before requesting a manual clock-out.");
        }
        
        if (attendance.get().getCheckOutTime() != null) {
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
        
        // Convert "HH:mm" to ISO if needed, or assume it's sent as HH:mm and we attach it to the date later
        request.setRequestedCheckOutTime(time);
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
            // Apply the clock-out
            AttendanceDetails attendance = attendanceRepository.findByUserIdAndTenantIdAndAttendanceDate(
                    request.getUserId(), tenantId, request.getAttendanceDate()
            ).orElseThrow(() -> new RuntimeException("Attendance record not found"));

            LocalDateTime checkInTime = LocalDateTime.parse(attendance.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            // requestedCheckOutTime might be just "HH:mm" or ISO. We assume "HH:mm" or "HH:mm:ss" if not ISO.
            LocalDateTime checkOutTime;
            try {
                if (request.getRequestedCheckOutTime().contains("T")) {
                    checkOutTime = LocalDateTime.parse(request.getRequestedCheckOutTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } else {
                    LocalTime time = LocalTime.parse(request.getRequestedCheckOutTime());
                    checkOutTime = LocalDateTime.of(LocalDate.parse(request.getAttendanceDate()), time);
                }
            } catch (Exception e) {
                // Fallback parsing if something fails
                checkOutTime = LocalDateTime.now(); 
            }

            // Ensure checkOutTime is after checkInTime
            if (checkOutTime.isBefore(checkInTime)) {
                // If it's a night shift that crossed midnight, add 1 day
                checkOutTime = checkOutTime.plusDays(1);
            }

            attendance.setCheckOutTime(checkOutTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            Duration duration = Duration.between(checkInTime, checkOutTime);
            long hours = duration.toHours();
            long minutes = duration.toMinutesPart();
            attendance.setWorkHours(String.format("%02d:%02d", hours, minutes));

            attendanceRepository.save(attendance);
        }

        request.setStatus(status);
        return requestRepository.save(request);
    }
}

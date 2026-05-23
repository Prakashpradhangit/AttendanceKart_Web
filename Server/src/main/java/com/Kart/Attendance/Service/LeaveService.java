package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.LeaveRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    public LeaveRequest applyLeave(LeaveRequest request, Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        request.setTenantId(tenantId);
        request.setUserId(String.valueOf(userId));
        request.setStatus("PENDING");
        return leaveRepository.save(request);
    }

    public List<LeaveRequest> getLeaves(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        return leaveRepository.findByUserIdAndTenantId(String.valueOf(userId), tenantId);
    }

    public long getApprovedLeaveCount(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        return leaveRepository.countByUserIdAndTenantIdAndStatus(String.valueOf(userId), tenantId, "APPROVED");
    }

    public long getPendingLeaveCount() {
        String tenantId = TenantContext.getCurrentTenant();
        return leaveRepository.countByTenantIdAndStatus(tenantId, "PENDING");
    }

    public List<java.util.Map<String, Object>> getAllLeaves() {
        String tenantId = TenantContext.getCurrentTenant();
        List<LeaveRequest> list = leaveRepository.findByTenantId(tenantId);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        List<Long> userIds = list.stream()
                .map(LeaveRequest::getUserId)
                .map(id -> {
                    try {
                        return Long.parseLong(id);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, User> usersById = userIds.isEmpty()
                ? Collections.emptyMap()
                : userRepository.findByIdIn(userIds).stream().collect(Collectors.toMap(User::getId, user -> user));
        
        for (LeaveRequest req : list) {
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", req.getId());
            map.put("tenantId", req.getTenantId());
            map.put("userId", req.getUserId());
            map.put("leaveType", req.getLeaveType());
            map.put("duration", req.getDuration());
            map.put("fromDate", req.getFromDate());
            map.put("toDate", req.getToDate());
            map.put("reason", req.getReason());
            map.put("status", req.getStatus());
            map.put("leaveCategory", req.getLeaveCategory());
            
            try {
                Long uId = Long.parseLong(req.getUserId());
                User u = usersById.get(uId);
                if (u != null) {
                    map.put("employeeName", u.getName() != null ? u.getName() : "");
                    map.put("employeeCode", u.getEmployeeCode() != null ? u.getEmployeeCode() : "");
                } else {
                    map.put("employeeName", "Unknown");
                    map.put("employeeCode", "N/A");
                }
            } catch (Exception e) {
                map.put("employeeName", "Unknown");
                map.put("employeeCode", "N/A");
            }
            
            result.add(map);
        }
        return result;
    }

    public void updateLeaveStatus(Long leaveId, String status) {
        String tenantId = TenantContext.getCurrentTenant();
        LeaveRequest request = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if (!request.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Unauthorized");
        }
        request.setStatus(status);
        leaveRepository.save(request);
    }

    public void deleteLeave(Long leaveId, Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        LeaveRequest request = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if (!request.getTenantId().equals(tenantId) || !request.getUserId().equals(String.valueOf(userId))) {
            throw new RuntimeException("Unauthorized");
        }
        leaveRepository.delete(request);
    }
}

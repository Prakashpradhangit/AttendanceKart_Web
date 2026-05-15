package com.Kart.Attendance.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRepository leaveRepository;

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
        return leaveRepository.findByUserIdAndTenantIdAndStatus(String.valueOf(userId), tenantId, "APPROVED").size();
    }

    public long getPendingLeaveCount() {
        String tenantId = TenantContext.getCurrentTenant();
        return leaveRepository.countByTenantIdAndStatus(tenantId, "PENDING");
    }

    public List<LeaveRequest> getAllLeaves() {
        String tenantId = TenantContext.getCurrentTenant();
        return leaveRepository.findByTenantId(tenantId);
    }
}

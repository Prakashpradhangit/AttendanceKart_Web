package com.Kart.Attendance.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.UserRepository;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.LeaveRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final Attendance_Details attendanceRepository;
    private final LeaveRepository leaveRepository;

    public List<User> getAllUsers() {
        String tenantId = TenantContext.getCurrentTenant();
        if ("SYSTEM_SUPER_ADMIN".equals(tenantId)) {
            return userRepository.findAll();
        }
        return userRepository.findByTenantId(tenantId);
    }

    public User createUser(User user) {
        String tenantId = TenantContext.getCurrentTenant();
        user.setTenantId(tenantId);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        String tenantId = TenantContext.getCurrentTenant();
        return userRepository.findById(id).map(user -> {
            if (!tenantId.equals(user.getTenantId())) {
                throw new RuntimeException("User not found for this tenant");
            }

            if (userDetails.getName() != null) user.setName(userDetails.getName());
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getPhoneNumber() != null) user.setPhoneNumber(userDetails.getPhoneNumber());
            if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
            if (userDetails.getDepartment() != null) user.setDepartment(userDetails.getDepartment());
            if (userDetails.getDesignation() != null) user.setDesignation(userDetails.getDesignation());
            if (userDetails.getJoiningDate() != null) user.setJoiningDate(userDetails.getJoiningDate());
            if (userDetails.getEmployeeCode() != null) user.setEmployeeCode(userDetails.getEmployeeCode());
            if (userDetails.getGender() != null) user.setGender(userDetails.getGender());
            
            if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
                user.setPassword(userDetails.getPassword());
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getDashboardDetails(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        return user;
    }

    @Transactional
    public void deleteUser(Long id) {
        String tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        // Cascade delete associated records
        String userIdStr = String.valueOf(id);
        attendanceRepository.deleteByUserIdAndTenantId(userIdStr, tenantId);
        leaveRepository.deleteByUserIdAndTenantId(userIdStr, tenantId);

        userRepository.delete(user);
    }
}

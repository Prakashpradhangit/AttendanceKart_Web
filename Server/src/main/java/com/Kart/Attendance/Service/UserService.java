package com.Kart.Attendance.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        String tenantId = TenantContext.getCurrentTenant();
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

            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            user.setRole(userDetails.getRole());
            user.setDepartment(userDetails.getDepartment());
            user.setDesignation(userDetails.getDesignation());
            user.setJoiningDate(userDetails.getJoiningDate());
            user.setEmployeeCode(userDetails.getEmployeeCode());
            user.setGender(userDetails.getGender());
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

    public void deleteUser(Long id) {
        String tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        userRepository.delete(user);
    }
}

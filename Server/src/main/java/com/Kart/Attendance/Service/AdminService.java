package com.Kart.Attendance.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Entity.Type.User_Role;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public List<Admin> getAllAdmin(){
        return adminRepository.findAll();
    }

    @Transactional
    public Admin createNewAdmin(Admin admin){
        ensureTenantId(admin);
        Admin savedAdmin = adminRepository.save(admin);
        syncAdminUser(savedAdmin);
        return savedAdmin;
    }

    @Transactional
    public Admin updateAdmin(Long id, Admin adminDetails) {
        return adminRepository.findById(id).map(admin -> {
            admin.setName(adminDetails.getName());
            admin.setEmail(adminDetails.getEmail());
            admin.setOrganisation_name(adminDetails.getOrganisation_name());
            admin.setPhone_number(adminDetails.getPhone_number());
            if (adminDetails.getPassword() != null && !adminDetails.getPassword().isEmpty()) {
                admin.setPassword(adminDetails.getPassword());
            }
            admin.setSlug(adminDetails.getSlug());
            admin.setSubscription_year(adminDetails.getSubscription_year());
            admin.setStarting_date(adminDetails.getStarting_date());
            ensureTenantId(admin);
            Admin savedAdmin = adminRepository.save(admin);
            syncAdminUser(savedAdmin);
            return savedAdmin;
        }).orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @Transactional
    public void deleteAdmin(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (admin.getTenantId() != null && !admin.getTenantId().isBlank()) {
            userRepository.deleteByTenantId(admin.getTenantId());
        }
        adminRepository.delete(admin);
    }

    private void ensureTenantId(Admin admin) {
        if ((admin.getTenantId() == null || admin.getTenantId().isBlank()) && admin.getOrganisation_name() != null) {
            String tenantId = admin.getOrganisation_name()
                    .trim()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]+", "_")
                    .replaceAll("^_+|_+$", "");
            admin.setTenantId("org_" + tenantId);
        }
    }

    private void syncAdminUser(Admin admin) {
        if (admin.getTenantId() == null || admin.getTenantId().isBlank()
                || admin.getName() == null || admin.getEmail() == null || admin.getPhone_number() == null) {
            return;
        }

        User adminUser = userRepository.findFirstByTenantIdAndRole(admin.getTenantId(), User_Role.ADMIN)
                .orElseGet(User::new);
        adminUser.setName(admin.getName());
        adminUser.setTenantId(admin.getTenantId());
        adminUser.setEmail(admin.getEmail());
        adminUser.setRole(User_Role.ADMIN);
        adminUser.setPhoneNumber(admin.getPhone_number());
        adminUser.setDepartment("Administration");
        adminUser.setDesignation("Organization Admin");
        adminUser.setJoiningDate(admin.getStarting_date());
        userRepository.save(adminUser);
    }
}

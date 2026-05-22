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
        List<Admin> admins = adminRepository.findAll();
        for (Admin a : admins) {
            if (a.getTenantId() != null) {
                long count = userRepository.findByTenantId(a.getTenantId()).stream()
                        .filter(u -> u.getRole() != com.Kart.Attendance.Entity.Type.User_Role.ADMIN)
                        .filter(u -> !"Inactive".equalsIgnoreCase(u.getStatus()))
                        .count();
                a.setUserCount(count);
            }
        }
        return admins;
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
            admin.setShortForm(adminDetails.getShortForm());
            admin.setPhone_number(adminDetails.getPhone_number());
            if (adminDetails.getPassword() != null && !adminDetails.getPassword().isEmpty()) {
                admin.setPassword(adminDetails.getPassword());
            }
            admin.setSlug(adminDetails.getSlug());
            admin.setSubscription_year(adminDetails.getSubscription_year());
            admin.setStarting_date(adminDetails.getStarting_date());
            if (adminDetails.getMaxUsers() != null) {
                admin.setMaxUsers(adminDetails.getMaxUsers());
            }
            if (adminDetails.getStatus() != null) {
                admin.setStatus(adminDetails.getStatus());
            }
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

        User adminUser = userRepository.findByEmail(admin.getEmail())
                .orElseGet(User::new);
        adminUser.setName(admin.getName());
        adminUser.setTenantId(admin.getTenantId());
        adminUser.setEmail(admin.getEmail());
        adminUser.setRole(User_Role.ADMIN);
        adminUser.setPhoneNumber(admin.getPhone_number());
        adminUser.setDepartment("Administration");
        adminUser.setDesignation("Organization Admin");
        adminUser.setJoiningDate(admin.getStarting_date());

        // Generate the first employee code for the Admin based on the short form
        String prefix = (admin.getShortForm() != null && !admin.getShortForm().isBlank())
                ? admin.getShortForm().trim().toUpperCase()
                : "EMP";
        if (adminUser.getEmployeeCode() == null || adminUser.getEmployeeCode().isBlank() || 
            adminUser.getEmployeeCode().equals("EMP00001") || 
            (admin.getShortForm() != null && !adminUser.getEmployeeCode().startsWith(prefix))) {
            adminUser.setEmployeeCode(prefix + "00001");
        }

        userRepository.save(adminUser);
    }

    public Admin getAdminByTenantId(String tenantId) {
        return adminRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException("Admin settings not found"));
    }

    @Transactional
    public Admin updateSettings(String tenantId, java.util.Map<String, Object> settings) {
        Admin admin = adminRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        if (settings.containsKey("lateThresholdTime")) admin.setLateThresholdTime((String) settings.get("lateThresholdTime"));
        if (settings.containsKey("defaultCheckInTime")) admin.setDefaultCheckInTime((String) settings.get("defaultCheckInTime"));
        if (settings.containsKey("defaultCheckOutTime")) admin.setDefaultCheckOutTime((String) settings.get("defaultCheckOutTime"));
        if (settings.containsKey("gracePeriod")) {
            Object gp = settings.get("gracePeriod");
            if (gp instanceof Integer) admin.setGracePeriod((Integer) gp);
            else if (gp instanceof String) admin.setGracePeriod(Integer.parseInt((String) gp));
        }
        if (settings.containsKey("shiftDuration")) {
            Object sd = settings.get("shiftDuration");
            if (sd instanceof Double) admin.setShiftDuration((Double) sd);
            else if (sd instanceof Float) admin.setShiftDuration(((Float) sd).doubleValue());
            else if (sd instanceof Integer) admin.setShiftDuration(((Integer) sd).doubleValue());
            else if (sd instanceof String) admin.setShiftDuration(Double.parseDouble((String) sd));
        }
        if (settings.containsKey("shortForm") || settings.containsKey("short_form")) {
            String newShortForm = (String) (settings.containsKey("shortForm") ? settings.get("shortForm") : settings.get("short_form"));
            if (newShortForm != null) {
                admin.setShortForm(newShortForm.trim().toUpperCase());
            }
        }
        if (settings.containsKey("sickLeavesLimit")) {
            Object sl = settings.get("sickLeavesLimit");
            if (sl instanceof Integer) admin.setSickLeavesLimit((Integer) sl);
            else if (sl instanceof String) admin.setSickLeavesLimit(Integer.parseInt((String) sl));
        }
        if (settings.containsKey("casualLeavesLimit")) {
            Object cl = settings.get("casualLeavesLimit");
            if (cl instanceof Integer) admin.setCasualLeavesLimit((Integer) cl);
            else if (cl instanceof String) admin.setCasualLeavesLimit(Integer.parseInt((String) cl));
        }
        if (settings.containsKey("emergencyLeavesLimit")) {
            Object el = settings.get("emergencyLeavesLimit");
            if (el instanceof Integer) admin.setEmergencyLeavesLimit((Integer) el);
            else if (el instanceof String) admin.setEmergencyLeavesLimit(Integer.parseInt((String) el));
        }
        
        if (settings.containsKey("monthlyAccrualRate")) {
            Object mar = settings.get("monthlyAccrualRate");
            if (mar instanceof Double) admin.setMonthlyAccrualRate((Double) mar);
            else if (mar instanceof Float) admin.setMonthlyAccrualRate(((Float) mar).doubleValue());
            else if (mar instanceof Integer) admin.setMonthlyAccrualRate(((Integer) mar).doubleValue());
            else if (mar instanceof String) admin.setMonthlyAccrualRate(Double.parseDouble((String) mar));
        }
        if (settings.containsKey("declaredHolidays")) {
            admin.setDeclaredHolidays((String) settings.get("declaredHolidays"));
        }
        
        return adminRepository.save(admin);
    }
}

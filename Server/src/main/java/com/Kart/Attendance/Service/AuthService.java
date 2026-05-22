package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.SuperAdmin;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final com.Kart.Attendance.Repository.SuperAdminRepository superAdminRepository;
    private final UserRepository userRepository;

    public Map<String, String> login(String email, String password) {
        
        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByEmail(email);
        if (superAdminOpt.isPresent()) {
            SuperAdmin superAdmin = superAdminOpt.get();
            if (password != null && password.equals(superAdmin.getPassword())) {
                String token = UUID.randomUUID().toString();
                superAdmin.setAuthToken(token);
                superAdminRepository.save(superAdmin);

                return Map.of(
                    "message", "Super Admin Login successful",
                    "role", "SUPER_ADMIN",
                    "name", superAdmin.getName() != null ? superAdmin.getName() : "Super Admin",
                    "token", token
                );
            }
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Basic password check for now (should use password hashing in production)
            if (password != null && password.equals(admin.getPassword())) {
                if ("Inactive".equalsIgnoreCase(admin.getStatus())) {
                    throw new RuntimeException("This organization account has been disabled. Please contact to your service provider ");
                }
                String token = java.util.UUID.randomUUID().toString();
                admin.setAuthToken(token);
                adminRepository.save(admin);

                return Map.of(
                    "message", "Login successful",
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : "super_admin",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : "",
                    "role", "ADMIN",
                    "token", token
                );
            }
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password != null && password.equals(user.getPassword())) {
                if ("Inactive".equalsIgnoreCase(user.getStatus())) {
                    throw new RuntimeException("Your account is inactive. Please contact your administrator.");
                }
                if (user.getTenantId() != null) {
                    Admin tenantAdmin = adminRepository.findByTenantId(user.getTenantId()).orElse(null);
                    if (tenantAdmin != null && "Inactive".equalsIgnoreCase(tenantAdmin.getStatus())) {
                        throw new RuntimeException("Your organization's access has been disabled. Please contact your administrator.");
                    }
                }
                String token = UUID.randomUUID().toString();
                user.setAuthToken(token);
                userRepository.save(user);

                return Map.of(
                    "message", "User Login successful",
                    "role", "USER",
                    "userRole", user.getRole() != null ? user.getRole().name() : "",
                    "tenantId", user.getTenantId() != null ? user.getTenantId() : "",
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : "",
                    "token", token
                );
            }
        }
        
        return null; // Return null if login fails
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        superAdminRepository.findByAuthToken(token).ifPresent(superAdmin -> {
            superAdmin.setAuthToken(null);
            superAdminRepository.save(superAdmin);
        });

        adminRepository.findByAuthToken(token).ifPresent(admin -> {
            admin.setAuthToken(null);
            adminRepository.save(admin);
        });

        userRepository.findByAuthToken(token).ifPresent(user -> {
            user.setAuthToken(null);
            userRepository.save(user);
        });
    }

    public Map<String, String> getSession(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByAuthToken(token);
        if (superAdminOpt.isPresent()) {
            return Map.of(
                    "role", "SUPER_ADMIN",
                    "token", token
            );
        }

        Optional<Admin> adminOpt = adminRepository.findByAuthToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return Map.of(
                    "role", "ADMIN",
                    "token", token,
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : "",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : ""
            );
        }

        Optional<User> userOpt = userRepository.findByAuthToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("Inactive".equalsIgnoreCase(user.getStatus())) {
                return null;
            }
            return Map.of(
                    "role", "USER",
                    "token", token,
                    "userRole", user.getRole() != null ? user.getRole().name() : "",
                    "tenantId", user.getTenantId() != null ? user.getTenantId() : "",
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : ""
            );
        }

        return null;
    }

    public Map<String, Object> getProfile(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByAuthToken(token);
        if (superAdminOpt.isPresent()) {
            SuperAdmin sa = superAdminOpt.get();
            return Map.of(
                    "role", "SUPER_ADMIN",
                    "name", sa.getName() != null ? sa.getName() : "Super Admin",
                    "email", sa.getEmail() != null ? sa.getEmail() : ""
            );
        }

        Optional<Admin> adminOpt = adminRepository.findByAuthToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return Map.of(
                    "role", "ADMIN",
                    "name", admin.getName() != null ? admin.getName() : "Admin",
                    "email", admin.getEmail() != null ? admin.getEmail() : "",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : "",
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : ""
            );
        }

        Optional<User> userOpt = userRepository.findByAuthToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            java.time.LocalDate jd = user.getJoiningDate();
            java.time.LocalDate dob = user.getDob();
            
            java.util.Map<String, Object> profile = new java.util.LinkedHashMap<>();
            profile.put("id", user.getId());
            profile.put("role", "USER");
            profile.put("name", user.getName() != null ? user.getName() : "");
            profile.put("email", user.getEmail() != null ? user.getEmail() : "");
            profile.put("employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : "");
            profile.put("department", user.getDepartment() != null ? user.getDepartment() : "");
            profile.put("designation", user.getDesignation() != null ? user.getDesignation() : "");
            profile.put("tenantId", user.getTenantId() != null ? user.getTenantId() : "");
            profile.put("joiningDate", jd != null ? jd.toString() : "");
            profile.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
            profile.put("gender", user.getGender() != null ? user.getGender() : "");
            profile.put("address", user.getAddress() != null ? user.getAddress() : "");
            profile.put("emergencyContactName", user.getEmergencyContactName() != null ? user.getEmergencyContactName() : "");
            profile.put("emergencyContactPhone", user.getEmergencyContactPhone() != null ? user.getEmergencyContactPhone() : "");
            profile.put("emergencyContactAddress", user.getEmergencyContactAddress() != null ? user.getEmergencyContactAddress() : "");
            profile.put("maritalStatus", user.getMaritalStatus() != null ? user.getMaritalStatus() : "");
            profile.put("nationality", user.getNationality() != null ? user.getNationality() : "");
            profile.put("dob", dob != null ? dob.toString() : "");
            profile.put("bloodGroup", user.getBloodGroup() != null ? user.getBloodGroup() : "");
            profile.put("personalEmail", user.getPersonalEmail() != null ? user.getPersonalEmail() : "");
            profile.put("profileImage", user.getProfileImage() != null ? user.getProfileImage() : "");
            
            profile.put("panNumber", user.getPanNumber() != null ? user.getPanNumber() : "");
            profile.put("panCard", user.getPanCard() != null ? user.getPanCard() : "");
            profile.put("aadharNumber", user.getAadharNumber() != null ? user.getAadharNumber() : "");
            profile.put("aadharCard", user.getAadharCard() != null ? user.getAadharCard() : "");
            profile.put("accountNumber", user.getAccountNumber() != null ? user.getAccountNumber() : "");
            profile.put("bankPassbook", user.getBankPassbook() != null ? user.getBankPassbook() : "");
            profile.put("lastPayslip", user.getLastPayslip() != null ? user.getLastPayslip() : "");
            
            return profile;
        }

        return null;
    }

    public Map<String, Object> updateProfile(String token, Map<String, Object> updates) {
        if (token == null || token.isBlank()) {
            return null;
        }

        Optional<User> userOpt = userRepository.findByAuthToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Name
            if (updates.containsKey("name")) {
                user.setName((String) updates.get("name"));
            }
            // Phone
            if (updates.containsKey("phoneNumber")) {
                user.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            // Gender
            if (updates.containsKey("gender")) {
                user.setGender((String) updates.get("gender"));
            }
            // Designation
            if (updates.containsKey("designation")) {
                user.setDesignation((String) updates.get("designation"));
            }
            // Department
            if (updates.containsKey("department")) {
                user.setDepartment((String) updates.get("department"));
            }
            // Joining Date
            if (updates.containsKey("joiningDate") && updates.get("joiningDate") != null) {
                try {
                    user.setJoiningDate(java.time.LocalDate.parse((String) updates.get("joiningDate")));
                } catch (Exception e) {
                    // Ignore or log date parsing errors
                }
            }
            // Address
            if (updates.containsKey("address")) {
                user.setAddress((String) updates.get("address"));
            }
            // Emergency Contact Name
            if (updates.containsKey("emergencyContactName")) {
                user.setEmergencyContactName((String) updates.get("emergencyContactName"));
            }
            // Emergency Contact Phone
            if (updates.containsKey("emergencyContactPhone")) {
                user.setEmergencyContactPhone((String) updates.get("emergencyContactPhone"));
            }
            // Emergency Contact Address
            if (updates.containsKey("emergencyContactAddress")) {
                user.setEmergencyContactAddress((String) updates.get("emergencyContactAddress"));
            }
            // Marital Status
            if (updates.containsKey("maritalStatus")) {
                user.setMaritalStatus((String) updates.get("maritalStatus"));
            }
            // Nationality
            if (updates.containsKey("nationality")) {
                user.setNationality((String) updates.get("nationality"));
            }
            // DOB
            if (updates.containsKey("dob") && updates.get("dob") != null && !((String) updates.get("dob")).isBlank()) {
                try {
                    user.setDob(java.time.LocalDate.parse((String) updates.get("dob")));
                } catch (Exception e) {
                    // Ignore or log date parsing errors
                }
            }
            // Blood Group
            if (updates.containsKey("bloodGroup")) {
                user.setBloodGroup((String) updates.get("bloodGroup"));
            }
            // Personal Email
            if (updates.containsKey("personalEmail")) {
                user.setPersonalEmail((String) updates.get("personalEmail"));
            }
            // Profile Image
            if (updates.containsKey("profileImage")) {
                user.setProfileImage((String) updates.get("profileImage"));
            }
            // PAN number & card
            if (updates.containsKey("panNumber")) {
                user.setPanNumber((String) updates.get("panNumber"));
            }
            if (updates.containsKey("panCard")) {
                user.setPanCard((String) updates.get("panCard"));
            }
            // Aadhar number & card
            if (updates.containsKey("aadharNumber")) {
                user.setAadharNumber((String) updates.get("aadharNumber"));
            }
            if (updates.containsKey("aadharCard")) {
                user.setAadharCard((String) updates.get("aadharCard"));
            }
            // Bank Account number & passbook
            if (updates.containsKey("accountNumber")) {
                user.setAccountNumber((String) updates.get("accountNumber"));
            }
            if (updates.containsKey("bankPassbook")) {
                user.setBankPassbook((String) updates.get("bankPassbook"));
            }
            // Last Payslip
            if (updates.containsKey("lastPayslip")) {
                user.setLastPayslip((String) updates.get("lastPayslip"));
            }
            
            userRepository.save(user);
            return getProfile(token);
        }
        
        return null;
    }
}

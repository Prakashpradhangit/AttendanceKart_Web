package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.AdminResponseDTO;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public List<AdminResponseDTO> getDashboardStats() {
        List<Admin> admins = adminRepository.findAll();
        Map<String, Long> activeCountsByTenant = userRepository
                .countActiveEmployeesByTenant(com.Kart.Attendance.Entity.Type.User_Role.ADMIN, "Inactive")
                .stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));
        return admins.stream().map(admin -> {
            AdminResponseDTO dto = new AdminResponseDTO();
            dto.setId(admin.getId());
            dto.setName(admin.getName());
            dto.setEmail(admin.getEmail());
            dto.setOrganisationName(admin.getOrganisation_name());
            dto.setShortForm(admin.getShortForm());
            dto.setPhoneNumber(admin.getPhone_number());
            dto.setSlug(admin.getSlug());
            
            LocalDate validity = null;
            if (admin.getStarting_date() != null && admin.getSubscription_year() != null) {
                int years = 1;
                switch(admin.getSubscription_year()) {
                    case ONE_YEAR: years = 1; break;
                    case TWO_YEAR: years = 2; break;
                    case THREE_YEAR: years = 3; break;
                    case FOUR_YEAR: years = 4; break;
                    case FIVE_YEAR: years = 5; break;
                    case SIX_YEAR: years = 6; break;
                    case SEVEN_YEAR: years = 7; break;
                    case EIGHT_YEAR: years = 8; break;
                    case NINE_YEAR: years = 9; break;
                    case TEN_YEAR: years = 10; break;
                }
                try {
                    validity = admin.getStarting_date().plusYears(years);
                } catch (Exception e) {
                    // Ignore error, validity remains null
                }
            }
            dto.setSubscriptionValidity(validity);
            dto.setStartingDate(admin.getStarting_date());
            if (admin.getSubscription_year() != null) {
                dto.setSubscriptionYear(admin.getSubscription_year().name());
            }
            
            dto.setUserCount(activeCountsByTenant.getOrDefault(admin.getTenantId(), 0L));
            dto.setMaxUsers(admin.getMaxUsers());
            return dto;
        }).collect(Collectors.toList());
    }
}

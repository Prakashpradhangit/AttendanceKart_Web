package com.Kart.Attendance.Config;

import com.Kart.Attendance.Entity.SuperAdmin;
import com.Kart.Attendance.Repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SuperAdminRepository superAdminRepository;

    @Override
    public void run(String... args) throws Exception {
        if (superAdminRepository.count() == 0) {
            SuperAdmin superAdmin = new SuperAdmin();
            superAdmin.setEmail("superadmin@solviontech.com");
            superAdmin.setPassword("SuperAdmin@123");
            superAdminRepository.save(superAdmin);
            System.out.println("Default Super Admin created: superadmin@solviontech.com / SuperAdmin@123");
        }
    }
}

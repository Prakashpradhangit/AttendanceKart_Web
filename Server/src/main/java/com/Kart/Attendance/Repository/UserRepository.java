package com.Kart.Attendance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Entity.Type.User_Role;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByTenantId(String tenantId);
    Optional<User> findByEmail(String email);
    Optional<User> findByAuthToken(String authToken);
    Optional<User> findFirstByTenantIdAndRole(String tenantId, User_Role role);
    long countByTenantId(String tenantId);
    void deleteByTenantId(String tenantId);
}

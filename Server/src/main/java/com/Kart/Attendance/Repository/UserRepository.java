package com.Kart.Attendance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Entity.Type.User_Role;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByTenantId(String tenantId);
    Page<User> findByTenantId(String tenantId, Pageable pageable);
    Optional<User> findByEmail(String email);
    List<User> findByEmailIn(Collection<String> emails);
    Optional<User> findByAuthToken(String authToken);
    Optional<User> findTopByTenantIdAndEmployeeCodeStartingWithOrderByEmployeeCodeDesc(String tenantId, String employeeCodePrefix);
    Optional<User> findFirstByTenantIdAndRole(String tenantId, User_Role role);
    long countByTenantId(String tenantId);
    long countByTenantIdAndRole(String tenantId, User_Role role);
    long countByTenantIdAndRoleNotAndStatusNotIgnoreCase(String tenantId, User_Role role, String status);
    long countByRoleNotAndStatusNotIgnoreCase(User_Role role, String status);
    void deleteByTenantId(String tenantId);

    @Modifying
    @Query("update User u set u.authToken = null where u.tenantId = :tenantId")
    int clearAuthTokensByTenantId(@Param("tenantId") String tenantId);

    @Query("""
            select u from User u
            where u.tenantId = :tenantId
              and u.role <> :excludedRole
              and (:search is null or :search = ''
                   or lower(u.name) like lower(concat('%', :search, '%'))
                   or lower(u.email) like lower(concat('%', :search, '%'))
                   or lower(u.employeeCode) like lower(concat('%', :search, '%')))
              and (:department is null or :department = '' or u.department = :department)
            """)
    Page<User> findEmployeesByTenant(
            @Param("tenantId") String tenantId,
            @Param("excludedRole") User_Role excludedRole,
            @Param("search") String search,
            @Param("department") String department,
            Pageable pageable
    );

    @Query("""
            select u from User u
            where u.role <> :excludedRole
              and (:search is null or :search = ''
                   or lower(u.name) like lower(concat('%', :search, '%'))
                   or lower(u.email) like lower(concat('%', :search, '%'))
                   or lower(u.employeeCode) like lower(concat('%', :search, '%')))
              and (:department is null or :department = '' or u.department = :department)
            """)
    Page<User> findEmployeesForSuperAdmin(
            @Param("excludedRole") User_Role excludedRole,
            @Param("search") String search,
            @Param("department") String department,
            Pageable pageable
    );

    @Query("""
            select u.tenantId, count(u)
            from User u
            where u.role <> :excludedRole and lower(u.status) <> lower(:inactiveStatus)
            group by u.tenantId
            """)
    List<Object[]> countActiveEmployeesByTenant(
            @Param("excludedRole") User_Role excludedRole,
            @Param("inactiveStatus") String inactiveStatus
    );

    List<User> findByIdIn(Collection<Long> ids);
}

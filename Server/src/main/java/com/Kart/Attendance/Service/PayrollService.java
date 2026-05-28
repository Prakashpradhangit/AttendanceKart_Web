package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Entity.Payroll;
import com.Kart.Attendance.Entity.PayslipRequest;
import com.Kart.Attendance.Entity.SalaryStructure;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.LeaveRepository;
import com.Kart.Attendance.Repository.PayrollRepository;
import com.Kart.Attendance.Repository.PayslipRequestRepository;
import com.Kart.Attendance.Repository.SalaryStructureRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PayrollService {
    private final PayrollRepository payrollRepository;
    private final PayslipRequestRepository payslipRequestRepository;
    private final UserRepository userRepository;
    private final Attendance_Details attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    public List<User> getActiveEmployees(String tenantId) {
        List<User> all = userRepository.findByTenantId(tenantId);
        List<User> active = new ArrayList<>();
        for (User u : all) {
            if (u.getRole() != com.Kart.Attendance.Entity.Type.User_Role.ADMIN) {
                if (u.getStatus() == null || !"Inactive".equalsIgnoreCase(u.getStatus())) {
                    active.add(u);
                }
            }
        }
        return active;
    }

    // Salary Structure Configuration & Revision History
    public List<SalaryStructure> getSalaryStructures(Long userId, String tenantId) {
        return salaryStructureRepository.findByUserIdAndTenantIdOrderByEffectiveDateDesc(userId, tenantId);
    }

    @Transactional
    public SalaryStructure saveSalaryStructure(SalaryStructure structure, String tenantId) {
        structure.setTenantId(tenantId);
        if (structure.getEffectiveDate() == null) {
            structure.setEffectiveDate(LocalDate.now());
        }

        // Percentage-based calculation mode updates components dynamically
        if ("PERCENTAGE_BASED".equalsIgnoreCase(structure.getCalculationMode())) {
            double basic = structure.getBasicSalary();
            structure.setHra(Math.round(basic * (structure.getHraPercent() / 100.0)));
            structure.setDa(Math.round(basic * (structure.getDaPercent() / 100.0)));
            
            double gross = basic + structure.getHra() + structure.getDa() + 
                    structure.getConveyanceAllowance() + structure.getMedicalAllowance() + 
                    structure.getSpecialAllowance() + structure.getOtherAllowances();

            structure.setProvidentFund(Math.round(basic * (structure.getPfPercent() / 100.0)));
            structure.setEsi(Math.round(gross * (structure.getEsiPercent() / 100.0)));
            structure.setTds(Math.round(gross * (structure.getTdsPercent() / 100.0)));
        }

        SalaryStructure saved = salaryStructureRepository.save(structure);

        // Sync to User entity profile for backward compatibility and profile persistence
        userRepository.findById(structure.getUserId()).ifPresent(user -> {
            user.setBasicSalary(structure.getBasicSalary());
            if (structure.getBankName() != null) user.setBankName(structure.getBankName());
            if (structure.getIfscCode() != null) user.setIfscCode(structure.getIfscCode());
            if (structure.getAccountNumber() != null) user.setAccountNumber(structure.getAccountNumber());
            if (structure.getUanNumber() != null) user.setUanNumber(structure.getUanNumber());
            if (structure.getPfNumber() != null) user.setPfNumber(structure.getPfNumber());
            if (structure.getEsiNumber() != null) user.setEsiNumber(structure.getEsiNumber());
            userRepository.save(user);
        });

        return saved;
    }

    public Map<String, Object> calculateSuggestion(Long userId, String month, String tenantId) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Parse month (e.g. "April 2025")
        String[] parts = month.trim().split("\\s+");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid month format. Expected 'Month YYYY'");
        }
        String monthName = parts[0];
        String year = parts[1];

        String monthNum = switch (monthName.toLowerCase()) {
            case "january", "jan" -> "01";
            case "february", "feb" -> "02";
            case "march", "mar" -> "03";
            case "april", "apr" -> "04";
            case "may" -> "05";
            case "june", "jun" -> "06";
            case "july", "jul" -> "07";
            case "august", "aug" -> "08";
            case "september", "sep" -> "09";
            case "october", "oct" -> "10";
            case "november", "nov" -> "11";
            case "december", "dec" -> "12";
            default -> "01";
        };

        int yearInt = Integer.parseInt(year);
        int monthInt = Integer.parseInt(monthNum);
        int totalDays = YearMonth.of(yearInt, monthInt).lengthOfMonth();
        LocalDate monthStart = LocalDate.of(yearInt, monthInt, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(totalDays);

        // 1. Fetch active SalaryStructure on or before monthEnd
        Optional<SalaryStructure> structOpt = salaryStructureRepository
                .findFirstByUserIdAndTenantIdAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(userId, tenantId, monthEnd);

        double basic = employee.getBasicSalary() != null ? employee.getBasicSalary() : 30000.0;
        double hra = Math.round(basic * 0.40);
        double da = 0.0;
        double conveyance = 1600.0;
        double medical = 1250.0;
        double special = 5000.0;
        double otherAllowances = 2000.0;
        double bonus = 0.0;

        double pfPercent = 12.0;
        double esiPercent = 0.75;
        double tdsPercent = 0.0;

        double pf = 0.0;
        double esi = 0.0;
        double profTax = 200.0;
        double tds = 0.0;
        double otherDeductions = 0.0;

        String uan = employee.getUanNumber() != null ? employee.getUanNumber() : "";
        String pfNo = employee.getPfNumber() != null ? employee.getPfNumber() : "";
        String esiNo = employee.getEsiNumber() != null ? employee.getEsiNumber() : "";
        String bank = employee.getBankName() != null ? employee.getBankName() : "";
        String ifsc = employee.getIfscCode() != null ? employee.getIfscCode() : "";
        String account = employee.getAccountNumber() != null ? employee.getAccountNumber() : "";

        if (structOpt.isPresent()) {
            SalaryStructure struct = structOpt.get();
            basic = struct.getBasicSalary();
            hra = struct.getHra();
            da = struct.getDa();
            conveyance = struct.getConveyanceAllowance();
            medical = struct.getMedicalAllowance();
            special = struct.getSpecialAllowance();
            otherAllowances = struct.getOtherAllowances();
            bonus = struct.getPerformanceBonus();

            pfPercent = struct.getPfPercent();
            esiPercent = struct.getEsiPercent();
            tdsPercent = struct.getTdsPercent();

            pf = struct.getProvidentFund();
            esi = struct.getEsi();
            profTax = struct.getProfessionalTax();
            tds = struct.getTds();
            otherDeductions = struct.getOtherDeductions();
        }

        // 2. Fetch attendance records
        String yearMonth = year + "-" + monthNum;
        List<AttendanceDetails> attendances = attendanceRepository
                .findByUserIdAndTenantIdAndAttendanceDateStartingWith(String.valueOf(userId), tenantId, yearMonth);

        double presentDays = 0;
        double absentDays = 0;
        int lateCount = 0;
        int halfDayCount = 0;
        for (AttendanceDetails ad : attendances) {
            String status = ad.getStatus();
            if (status != null) {
                if (status.equalsIgnoreCase("PRESENT") || status.equalsIgnoreCase("Present")
                        || status.equalsIgnoreCase("ON TIME") || status.equalsIgnoreCase("On Time")
                        || status.equalsIgnoreCase("ON-TIME") || status.equalsIgnoreCase("On-Time")) {
                    presentDays += 1.0;
                } else if (status.equalsIgnoreCase("LATE") || status.equalsIgnoreCase("Late")) {
                    presentDays += 1.0;
                    lateCount++;
                } else if (status.equalsIgnoreCase("ABSENT") || status.equalsIgnoreCase("Absent")) {
                    absentDays += 1.0;
                } else if (status.equalsIgnoreCase("HALF_DAY") || status.equalsIgnoreCase("Half Day")
                        || status.equalsIgnoreCase("First Half") || status.equalsIgnoreCase("Second Half")) {
                    presentDays += 0.5;
                    halfDayCount++;
                }
            }
        }

        // 3. Fetch approved leaves overlapping this month
        List<LeaveRequest> leaves = leaveRepository.findByUserIdAndTenantIdAndStatus(String.valueOf(userId), tenantId, "APPROVED");
        int totalLeaveDays = 0;
        int lopLeaveDays = 0;

        for (LeaveRequest lr : leaves) {
            try {
                LocalDate from = LocalDate.parse(lr.getFromDate());
                LocalDate to = LocalDate.parse(lr.getToDate());

                LocalDate overlapStart = from.isAfter(monthStart) ? from : monthStart;
                LocalDate overlapEnd = to.isBefore(monthEnd) ? to : monthEnd;

                if (!overlapStart.isAfter(overlapEnd)) {
                    long diff = ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                    totalLeaveDays += diff;
                    if ("LOP".equalsIgnoreCase(lr.getLeaveCategory()) || "UNPAID".equalsIgnoreCase(lr.getLeaveCategory())) {
                        lopLeaveDays += diff;
                    }
                }
            } catch (Exception e) {
                // Ignore parse exceptions
            }
        }

        // Count weekend days (Saturdays and Sundays) in the month
        int weekendDays = 0;
        for (LocalDate date = monthStart; !date.isAfter(monthEnd); date = date.plusDays(1)) {
            java.time.DayOfWeek dayOfWeek = date.getDayOfWeek();
            if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) {
                weekendDays++;
            }
        }
        int workingDays = totalDays - weekendDays;
        double computedAbsent = workingDays - presentDays - totalLeaveDays;
        if (computedAbsent > absentDays) {
            absentDays = Math.max(0.0, computedAbsent);
        }

        // 4. Late mark deduction rule: every 3 late marks count as 0.5 LOP days
        double lateMarkLopDays = (lateCount / 3) * 0.5;

        // 5. Total LOP Days calculation
        double totalLopDays = absentDays + lopLeaveDays + lateMarkLopDays;

        // 6. Paid Days / Payable Days calculation
        // General: paidDays = totalDays - LOP days
        double paidDays = totalDays - totalLopDays;
        if (paidDays < 0) paidDays = 0;
        if (paidDays > totalDays) paidDays = totalDays;

        double prorationFactor = totalDays > 0 ? (double) paidDays / totalDays : 1.0;

        // Prorated Earnings
        double proratedBasic = Math.round(basic * prorationFactor);
        double proratedHra = Math.round(hra * prorationFactor);
        double proratedDa = Math.round(da * prorationFactor);
        double proratedConveyance = Math.round(conveyance * prorationFactor);
        double proratedMedical = Math.round(medical * prorationFactor);
        double proratedSpecial = Math.round(special * prorationFactor);
        double proratedOtherAllowances = Math.round(otherAllowances * prorationFactor);
        double actualBonus = bonus; // Performance bonus is typically not prorated

        double proratedGross = proratedBasic + proratedHra + proratedDa + 
                proratedConveyance + proratedMedical + proratedSpecial + proratedOtherAllowances + actualBonus;

        // Prorated Statutory Deductions
        double computedPf = Math.round(proratedBasic * (pfPercent / 100.0));
        double computedEsi = Math.round(proratedGross * (esiPercent / 100.0));
        double computedPT = proratedGross >= 15000.0 ? profTax : 0.0;
        double computedTds = Math.round(proratedGross * (tdsPercent / 100.0));
        double proratedOtherDeductions = Math.round(otherDeductions * prorationFactor);

        double totalDeductions = computedPf + computedEsi + computedPT + computedTds + proratedOtherDeductions;
        double netSalary = proratedGross - totalDeductions;

        // Indian Compliance: Employer Contributions
        double employerPf = Math.round(proratedBasic * 0.12);
        double employerEsi = Math.round(proratedGross * 0.0325);
        double ctc = proratedGross + employerPf + employerEsi;

        String empCode = employee.getEmployeeCode() != null ? employee.getEmployeeCode() : String.valueOf(employee.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", empCode);
        result.put("employeeName", employee.getName());
        result.put("designation", employee.getDesignation() != null ? employee.getDesignation() : "");
        result.put("department", employee.getDepartment() != null ? employee.getDepartment() : "");
        result.put("phoneNumber", employee.getPhoneNumber() != null ? employee.getPhoneNumber() : "");
        result.put("doj", employee.getJoiningDate() != null ? employee.getJoiningDate().toString() : "");
        
        // Banking / Statutory data
        result.put("uanNumber", uan);
        result.put("pfNumber", pfNo);
        result.put("esiNumber", esiNo);
        result.put("bankName", bank);
        result.put("ifscCode", ifsc);
        result.put("accountNumber", account);

        result.put("month", month);
        result.put("basicSalary", proratedBasic);
        result.put("hra", proratedHra);
        result.put("da", proratedDa);
        result.put("conveyanceAllowance", proratedConveyance);
        result.put("medicalAllowance", proratedMedical);
        result.put("specialAllowance", proratedSpecial);
        result.put("otherAllowances", proratedOtherAllowances);
        result.put("performanceBonus", actualBonus);

        result.put("providentFund", computedPf);
        result.put("professionalTax", computedPT);
        result.put("incomeTax", computedTds);
        result.put("esi", computedEsi);
        result.put("otherDeductions", proratedOtherDeductions);
        result.put("attendanceDeduction", Math.round((basic + hra + da + conveyance + medical + special + otherAllowances) * (1 - prorationFactor)));

        result.put("totalDays", totalDays);
        result.put("presentDays", presentDays);
        result.put("absentDays", absentDays);
        result.put("leaveDays", totalLeaveDays);
        result.put("lopDays", totalLopDays);
        result.put("paidDays", paidDays);
        result.put("halfDays", halfDayCount);
        result.put("lateCount", lateCount);
        result.put("lopLeaveDays", lopLeaveDays);

        // Return the rates used so frontend can display and allow overrides
        result.put("pfPercent", pfPercent);
        result.put("esiPercent", esiPercent);
        result.put("tdsPercent", tdsPercent);
        result.put("profTax", computedPT);

        result.put("totalEarnings", proratedGross);
        result.put("totalDeductions", totalDeductions);
        result.put("netSalary", netSalary);

        result.put("employerPf", employerPf);
        result.put("employerEsi", employerEsi);
        result.put("ctc", ctc);

        return result;
    }

    @Transactional
    public Payroll savePayroll(Payroll payroll, String tenantId) {
        payroll.setTenantId(tenantId);

        // Prevent duplicate payroll generation for the same employee in the same month
        Optional<Payroll> existingOpt = payrollRepository.findByUserIdAndTenantIdAndMonth(
                payroll.getUserId(), tenantId, payroll.getMonth());
        if (existingOpt.isPresent()) {
            throw new IllegalArgumentException("Payroll record has already been generated for this employee in " + payroll.getMonth());
        }

        // Fetch employee details to snapshot metadata
        User user = userRepository.findById(payroll.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        payroll.setEmployeeName(user.getName());
        payroll.setEmployeeId(user.getEmployeeCode() != null ? user.getEmployeeCode() : String.valueOf(user.getId()));
        payroll.setDesignation(user.getDesignation());
        payroll.setPhoneNumber(user.getPhoneNumber());
        payroll.setDoj(user.getJoiningDate());

        // Snapshot banking & statutory compliance fields
        payroll.setUanNumber(user.getUanNumber());
        payroll.setPfNumber(user.getPfNumber());
        payroll.setEsiNumber(user.getEsiNumber());
        payroll.setBankName(user.getBankName());
        payroll.setIfscCode(user.getIfscCode());
        payroll.setAccountNumber(user.getAccountNumber());

        // Perform recalculation of totals for verification
        double earnings = payroll.getBasicSalary() + payroll.getHra() + payroll.getConveyanceAllowance() +
                payroll.getMedicalAllowance() + payroll.getSpecialAllowance() + payroll.getOtherAllowances() +
                payroll.getPerformanceBonus();
        double deductions = payroll.getProvidentFund() + payroll.getProfessionalTax() + payroll.getIncomeTax() +
                payroll.getEsi() + payroll.getOtherDeductions() + payroll.getAttendanceDeduction();

        payroll.setTotalEarnings(earnings);
        payroll.setTotalDeductions(deductions);
        payroll.setNetSalary(earnings - deductions);

        // Calculate statutory employer contributions for history tracking
        double basic = payroll.getBasicSalary();
        payroll.setEmployerPf(Math.round(basic * 0.12));
        payroll.setEmployerEsi(Math.round(earnings * 0.0325));
        payroll.setCtc(earnings + payroll.getEmployerPf() + payroll.getEmployerEsi());

        return payrollRepository.save(payroll);
    }

    @Transactional
    public Payroll updatePayroll(Long id, Payroll details, String tenantId) {
        Payroll existing = payrollRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        if (!existing.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Unauthorized access to payroll");
        }

        existing.setBasicSalary(details.getBasicSalary());
        existing.setHra(details.getHra());
        existing.setConveyanceAllowance(details.getConveyanceAllowance());
        existing.setMedicalAllowance(details.getMedicalAllowance());
        existing.setSpecialAllowance(details.getSpecialAllowance());
        existing.setOtherAllowances(details.getOtherAllowances());
        existing.setPerformanceBonus(details.getPerformanceBonus());

        existing.setProvidentFund(details.getProvidentFund());
        existing.setProfessionalTax(details.getProfessionalTax());
        existing.setIncomeTax(details.getIncomeTax());
        existing.setEsi(details.getEsi());
        existing.setOtherDeductions(details.getOtherDeductions());
        existing.setAttendanceDeduction(details.getAttendanceDeduction());

        existing.setTotalDays(details.getTotalDays());
        existing.setPresentDays(details.getPresentDays());
        existing.setAbsentDays(details.getAbsentDays());
        existing.setLeaveDays(details.getLeaveDays());
        existing.setStatus(details.getStatus());
        
        // Copy statutory snapshots & proration counts
        existing.setUanNumber(details.getUanNumber());
        existing.setPfNumber(details.getPfNumber());
        existing.setEsiNumber(details.getEsiNumber());
        existing.setBankName(details.getBankName());
        existing.setIfscCode(details.getIfscCode());
        existing.setAccountNumber(details.getAccountNumber());
        existing.setLopDays(details.getLopDays());
        existing.setPaidDays(details.getPaidDays());

        double earnings = details.getBasicSalary() + details.getHra() + details.getConveyanceAllowance() +
                details.getMedicalAllowance() + details.getSpecialAllowance() + details.getOtherAllowances() +
                details.getPerformanceBonus();
        double deductions = details.getProvidentFund() + details.getProfessionalTax() + details.getIncomeTax() +
                details.getEsi() + details.getOtherDeductions() + details.getAttendanceDeduction();

        existing.setTotalEarnings(earnings);
        existing.setTotalDeductions(deductions);
        existing.setNetSalary(earnings - deductions);

        existing.setEmployerPf(Math.round(details.getBasicSalary() * 0.12));
        existing.setEmployerEsi(Math.round(earnings * 0.0325));
        existing.setCtc(earnings + existing.getEmployerPf() + existing.getEmployerEsi());

        return payrollRepository.save(existing);
    }

    @Transactional
    public Payroll updateStatus(Long id, String status, String method, String txId, String tenantId) {
        Payroll existing = payrollRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        if (!existing.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Unauthorized access to payroll");
        }
        existing.setStatus(status);
        if ("PAID".equalsIgnoreCase(status)) {
            existing.setPaymentMethod(method);
            existing.setTransactionId(txId);
            existing.setPaymentDate(LocalDate.now());
        }
        return payrollRepository.save(existing);
    }

    public List<Payroll> getAllPayrolls(String tenantId) {
        return payrollRepository.findByTenantId(tenantId);
    }

    public List<Payroll> getEmployeePayrolls(Long userId, String tenantId) {
        return payrollRepository.findByUserIdAndTenantIdAndStatusIn(userId, tenantId, Arrays.asList("PENDING", "PAID"));
    }

    // Payslip Request Operations
    @Transactional
    public PayslipRequest createRequest(Long userId, String month, String reason, String tenantId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PayslipRequest request = new PayslipRequest();
        request.setTenantId(tenantId);
        request.setUserId(userId);
        request.setEmployeeName(user.getName());
        request.setEmployeeId(user.getEmployeeCode() != null ? user.getEmployeeCode() : String.valueOf(user.getId()));
        request.setMonth(month);
        request.setRequestDate(LocalDate.now().toString());
        request.setStatus("PENDING");
        request.setReason(reason);

        return payslipRequestRepository.save(request);
    }

    public List<PayslipRequest> getEmployeeRequests(Long userId, String tenantId) {
        return payslipRequestRepository.findByUserIdAndTenantId(userId, tenantId);
    }

    public List<PayslipRequest> getPendingRequests(String tenantId) {
        return payslipRequestRepository.findByTenantIdAndStatus(tenantId, "PENDING");
    }

    @Transactional
    public PayslipRequest updateRequestStatus(Long id, String status, String tenantId) {
        PayslipRequest request = payslipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        if (!request.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Unauthorized");
        }
        request.setStatus(status);
        return payslipRequestRepository.save(request);
    }
}

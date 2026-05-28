package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.AttendanceDetails;
import com.Kart.Attendance.Entity.LeaveRequest;
import com.Kart.Attendance.Entity.Payroll;
import com.Kart.Attendance.Entity.PayslipRequest;
import com.Kart.Attendance.Entity.SalaryStructure;
import com.Kart.Attendance.Entity.SalaryTemplate;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.LeaveRepository;
import com.Kart.Attendance.Repository.PayrollRepository;
import com.Kart.Attendance.Repository.PayslipRequestRepository;
import com.Kart.Attendance.Repository.SalaryStructureRepository;
import com.Kart.Attendance.Repository.SalaryTemplateRepository;
import com.Kart.Attendance.Repository.UserRepository;
import com.Kart.Attendance.Repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
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
    private final SalaryTemplateRepository salaryTemplateRepository;
    private final AdminRepository adminRepository;

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

    // Salary Templates Operations
    public List<SalaryTemplate> getTemplates(String tenantId) {
        return salaryTemplateRepository.findByTenantId(tenantId);
    }

    public List<SalaryTemplate> getActiveTemplates(String tenantId) {
        return salaryTemplateRepository.findByTenantIdAndActive(tenantId, true);
    }

    @Transactional
    public SalaryTemplate saveTemplate(SalaryTemplate template, String tenantId) {
        template.setTenantId(tenantId);
        
        double basic = template.getBasicSalary();
        template.setHra(Math.round(basic * (template.getHraPercent() / 100.0)));
        template.setDa(Math.round(basic * (template.getDaPercent() / 100.0)));
        
        double gross = basic + template.getHra() + template.getDa() + 
                template.getConveyanceAllowance() + template.getMedicalAllowance() + 
                template.getSpecialAllowance() + template.getOtherAllowances() +
                template.getPerformanceBonus() + template.getIncentives() + template.getOvertime() + template.getOtherEarnings();

        template.setProvidentFund(Math.round(basic * (template.getPfPercent() / 100.0)));
        template.setEsi(Math.round(gross * (template.getEsiPercent() / 100.0)));
        template.setTds(Math.round(gross * (template.getTdsPercent() / 100.0)));
        
        double totalDeductions = template.getProvidentFund() + template.getEsi() + template.getProfessionalTax() +
                template.getTds() + template.getInsurance() + template.getAdvanceDeduction() + template.getLoanDeduction() +
                template.getOtherDeductions();
                
        template.setGrossSalary(gross);
        template.setNetSalary(gross - totalDeductions);
        
        double empPf = Math.round(basic * 0.12);
        double empEsi = Math.round(gross * 0.0325);
        template.setMonthlyCtc(gross + empPf + empEsi);
        
        return salaryTemplateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id, String tenantId) {
        SalaryTemplate template = salaryTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        if (!template.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Unauthorized access");
        }
        salaryTemplateRepository.delete(template);
    }

    @Transactional
    public void assignTemplateToEmployees(Long templateId, List<Long> userIds, LocalDate effectiveDate, String tenantId) {
        SalaryTemplate template = salaryTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        if (!template.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Unauthorized access");
        }

        LocalDate effDate = (effectiveDate != null) ? effectiveDate : LocalDate.now();

        for (Long userId : userIds) {
            SalaryStructure structure = new SalaryStructure();
            structure.setUserId(userId);
            structure.setTenantId(tenantId);
            structure.setEffectiveDate(effDate);
            structure.setStructureType(template.getSalaryType());
            structure.setCalculationMode("PERCENTAGE_BASED");
            
            structure.setBasicSalary(template.getBasicSalary());
            structure.setHraPercent(template.getHraPercent());
            structure.setDaPercent(template.getDaPercent());
            structure.setPfPercent(template.getPfPercent());
            structure.setEsiPercent(template.getEsiPercent());
            structure.setTdsPercent(template.getTdsPercent());
            
            structure.setHra(template.getHra());
            structure.setDa(template.getDa());
            structure.setConveyanceAllowance(template.getConveyanceAllowance());
            structure.setMedicalAllowance(template.getMedicalAllowance());
            structure.setSpecialAllowance(template.getSpecialAllowance());
            structure.setOtherAllowances(template.getOtherAllowances());
            structure.setPerformanceBonus(template.getPerformanceBonus());
            structure.setIncentives(template.getIncentives());
            structure.setOvertime(template.getOvertime());
            structure.setOtherEarnings(template.getOtherEarnings());
            
            structure.setProvidentFund(template.getProvidentFund());
            structure.setEsi(template.getEsi());
            structure.setProfessionalTax(template.getProfessionalTax());
            structure.setTds(template.getTds());
            structure.setInsurance(template.getInsurance());
            structure.setAdvanceDeduction(template.getAdvanceDeduction());
            structure.setLoanDeduction(template.getLoanDeduction());
            structure.setOtherDeductions(template.getOtherDeductions());
            
            structure.setGrossSalary(template.getGrossSalary());
            structure.setNetSalary(template.getNetSalary());
            structure.setMonthlyCtc(template.getMonthlyCtc());
            structure.setSalaryType(template.getSalaryType());
            structure.setPaymentMode(template.getPaymentMode());
            structure.setPayrollFrequency(template.getPayrollFrequency());
            structure.setActive(true);

            // Inherit bank & statutory info from last structure
            List<SalaryStructure> existing = salaryStructureRepository.findByUserIdAndTenantIdOrderByEffectiveDateDesc(userId, tenantId);
            if (!existing.isEmpty()) {
                SalaryStructure last = existing.get(0);
                structure.setUanNumber(last.getUanNumber());
                structure.setPfNumber(last.getPfNumber());
                structure.setEsiNumber(last.getEsiNumber());
                structure.setBankName(last.getBankName());
                structure.setIfscCode(last.getIfscCode());
                structure.setAccountNumber(last.getAccountNumber());
            }

            salaryStructureRepository.save(structure);
            
            // Sync to User entity profile
            userRepository.findById(userId).ifPresent(user -> {
                user.setBasicSalary(template.getBasicSalary());
                userRepository.save(user);
            });
        }
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
                    structure.getSpecialAllowance() + structure.getOtherAllowances() +
                    structure.getPerformanceBonus() + structure.getIncentives() + structure.getOvertime() + structure.getOtherEarnings();

            structure.setProvidentFund(Math.round(basic * (structure.getPfPercent() / 100.0)));
            structure.setEsi(Math.round(gross * (structure.getEsiPercent() / 100.0)));
            structure.setTds(Math.round(gross * (structure.getTdsPercent() / 100.0)));
            
            double totalDeductions = structure.getProvidentFund() + structure.getEsi() + structure.getProfessionalTax() +
                    structure.getTds() + structure.getInsurance() + structure.getAdvanceDeduction() +
                    structure.getLoanDeduction() + structure.getOtherDeductions();
                    
            structure.setGrossSalary(gross);
            structure.setNetSalary(gross - totalDeductions);
            
            double empPf = Math.round(basic * 0.12);
            double empEsi = Math.round(gross * 0.0325);
            structure.setMonthlyCtc(gross + empPf + empEsi);
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

        // Load organization settings & policies
        Admin admin = adminRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Admin settings not found for tenant " + tenantId));

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

        // Fetch active SalaryStructure
        Optional<SalaryStructure> structOpt = salaryStructureRepository
                .findFirstByUserIdAndTenantIdAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(userId, tenantId, monthEnd);

        double basic = employee.getBasicSalary() != null ? employee.getBasicSalary() : 30000.0;
        double hra = Math.round(basic * 0.40);
        double da = 0.0;
        double conveyance = 1600.0;
        double medical = 1250.0;
        double special = 5000.0;
        double otherAllowances = 2000.0;
        double performanceBonus = 0.0;
        double incentives = 0.0;
        double overtimeBase = 0.0;
        double otherEarnings = 0.0;

        double pfPercent = 12.0;
        double esiPercent = 0.75;
        double tdsPercent = 0.0;

        double pf = 0.0;
        double esi = 0.0;
        double profTax = 200.0;
        double tds = 0.0;
        double insurance = 0.0;
        double advanceDeduction = 0.0;
        double loanDeduction = 0.0;
        double otherDeductions = 0.0;

        String uan = employee.getUanNumber() != null ? employee.getUanNumber() : "";
        String pfNo = employee.getPfNumber() != null ? employee.getPfNumber() : "";
        String esiNo = employee.getEsiNumber() != null ? employee.getEsiNumber() : "";
        String bank = employee.getBankName() != null ? employee.getBankName() : "";
        String ifsc = employee.getIfscCode() != null ? employee.getIfscCode() : "";
        String account = employee.getAccountNumber() != null ? employee.getAccountNumber() : "";
        
        String salaryType = "Monthly";
        String paymentMode = "Bank Transfer";
        String payrollFrequency = "Monthly";

        if (structOpt.isPresent()) {
            SalaryStructure struct = structOpt.get();
            basic = struct.getBasicSalary();
            hra = struct.getHra();
            da = struct.getDa();
            conveyance = struct.getConveyanceAllowance();
            medical = struct.getMedicalAllowance();
            special = struct.getSpecialAllowance();
            otherAllowances = struct.getOtherAllowances();
            performanceBonus = struct.getPerformanceBonus();
            incentives = struct.getIncentives();
            overtimeBase = struct.getOvertime();
            otherEarnings = struct.getOtherEarnings();

            pfPercent = struct.getPfPercent();
            esiPercent = struct.getEsiPercent();
            tdsPercent = struct.getTdsPercent();

            pf = struct.getProvidentFund();
            esi = struct.getEsi();
            profTax = struct.getProfessionalTax();
            tds = struct.getTds();
            insurance = struct.getInsurance();
            advanceDeduction = struct.getAdvanceDeduction();
            loanDeduction = struct.getLoanDeduction();
            otherDeductions = struct.getOtherDeductions();
            
            salaryType = struct.getSalaryType() != null ? struct.getSalaryType() : "Monthly";
            paymentMode = struct.getPaymentMode() != null ? struct.getPaymentMode() : "Bank Transfer";
            payrollFrequency = struct.getPayrollFrequency() != null ? struct.getPayrollFrequency() : "Monthly";
        }

        // Fetch declared holidays from Admin
        Set<LocalDate> holidayDates = new HashSet<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<?> list = mapper.readValue(admin.getDeclaredHolidays(), List.class);
            for (Object item : list) {
                if (item instanceof String) {
                    LocalDate d = LocalDate.parse((String) item);
                    if (!d.isBefore(monthStart) && !d.isAfter(monthEnd)) {
                        holidayDates.add(d);
                    }
                } else if (item instanceof Map) {
                    Object dateVal = ((Map<?, ?>) item).get("date");
                    if (dateVal instanceof String) {
                        LocalDate d = LocalDate.parse((String) dateVal);
                        if (!d.isBefore(monthStart) && !d.isAfter(monthEnd)) {
                            holidayDates.add(d);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // keep holiday list empty
        }

        // Fetch attendance records
        String yearMonth = year + "-" + monthNum;
        List<AttendanceDetails> attendances = attendanceRepository
                .findByUserIdAndTenantIdAndAttendanceDateStartingWith(String.valueOf(userId), tenantId, yearMonth);

        // Map attendance by date for O(1) lookup
        Map<String, AttendanceDetails> attMap = new HashMap<>();
        for (AttendanceDetails ad : attendances) {
            if (ad.getAttendanceDate() != null) {
                attMap.put(ad.getAttendanceDate(), ad);
            }
        }

        // Standard Shifts configuration
        LocalTime shiftStart = LocalTime.parse(admin.getDefaultCheckInTime());
        LocalTime shiftEnd = LocalTime.parse(admin.getDefaultCheckOutTime());
        int graceMinutes = admin.getGracePeriod();
        LocalTime lateThreshold = shiftStart.plusMinutes(graceMinutes);

        double presentDays = 0;
        double absentDays = 0;
        int lateCount = 0;
        int halfDayCount = 0;
        int missingPunches = 0;
        double totalOvertimeHours = 0.0;
        
        double lateComingPenalty = 0.0;
        double earlyCheckoutPenalty = 0.0;
        double missingPunchPenalty = 0.0;
        int weekendDays = 0;
        int holidays = 0;

        // Process calendar day by day
        for (LocalDate date = monthStart; !date.isAfter(monthEnd); date = date.plusDays(1)) {
            String dateStr = date.toString();
            boolean isWeekend = (date.getDayOfWeek() == java.time.DayOfWeek.SATURDAY || date.getDayOfWeek() == java.time.DayOfWeek.SUNDAY);
            boolean isHoliday = holidayDates.contains(date);

            if (isWeekend) {
                weekendDays++;
            } else if (isHoliday) {
                holidays++;
            }

            if (attMap.containsKey(dateStr)) {
                AttendanceDetails ad = attMap.get(dateStr);
                String status = ad.getStatus();
                
                // Track check-in / check-out times for policy deductions
                boolean hasCheckIn = ad.getCheckInTime() != null && !ad.getCheckInTime().isBlank();
                boolean hasCheckOut = ad.getCheckOutTime() != null && !ad.getCheckOutTime().isBlank();

                if (!hasCheckIn || !hasCheckOut) {
                    missingPunches++;
                    if (admin.isAutoPenaltyRulesEnabled()) {
                        missingPunchPenalty += 0.5; // Unresolved missing punch counts as 0.5 LOP day penalty
                    }
                    presentDays += 0.5;
                } else {
                    // Fully punched day
                    try {
                        LocalDateTime checkInDateTime = LocalDateTime.parse(ad.getCheckInTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                        LocalDateTime checkOutDateTime = LocalDateTime.parse(ad.getCheckOutTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                        LocalTime checkInTime = checkInDateTime.toLocalTime();
                        LocalTime checkOutTime = checkOutDateTime.toLocalTime();

                        // 1. Late arrival
                        if (checkInTime.isAfter(lateThreshold)) {
                            long minsLate = Duration.between(shiftStart, checkInTime).toMinutes();
                            if (minsLate > admin.getLateMinutesHalfDayThreshold() && admin.isAutoPenaltyRulesEnabled()) {
                                presentDays += 0.5;
                                halfDayCount++;
                            } else {
                                presentDays += 1.0;
                                lateCount++;
                            }
                        } else {
                            presentDays += 1.0;
                        }

                        // 2. Early checkout
                        double requiredHours = admin.getShiftDuration();
                        Duration actualDuration = Duration.between(checkInDateTime, checkOutDateTime);
                        double actualWorkHours = actualDuration.toMinutes() / 60.0;
                        
                        if (checkOutTime.isBefore(shiftEnd) || actualWorkHours < requiredHours) {
                            double earlyHours = Math.max(0.0, requiredHours - actualWorkHours);
                            if (earlyHours >= admin.getEarlyCheckoutHourThreshold() && admin.isAutoPenaltyRulesEnabled()) {
                                earlyCheckoutPenalty += admin.getEarlyCheckoutDeductionDays();
                            }
                        }

                        // 3. Overtime
                        if (actualWorkHours > requiredHours) {
                            totalOvertimeHours += (actualWorkHours - requiredHours);
                        }
                    } catch (Exception e) {
                        presentDays += 1.0; // Fallback in case of parse error
                    }
                }
            } else {
                // Not punched
                if (!isWeekend && !isHoliday) {
                    absentDays += 1.0;
                }
            }
        }

        // Fetch leaves overlapping this month
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
                // ignore
            }
        }

        // Adjust absent days based on leaves
        absentDays = Math.max(0.0, absentDays - totalLeaveDays);

        // Apply 3 late marks policy
        if (admin.isAutoPenaltyRulesEnabled() && lateCount > 0) {
            lateComingPenalty = (lateCount / admin.getLateCountThreshold()) * admin.getLateDeductionDays();
        }

        // Total LOP Days computation
        double totalLopDays = absentDays + lopLeaveDays + lateComingPenalty + earlyCheckoutPenalty + missingPunchPenalty + (halfDayCount * 0.5);
        double paidDays = totalDays - totalLopDays;
        
        if (paidDays < 0) paidDays = 0;
        if (paidDays > totalDays) paidDays = totalDays;

        double prorationFactor = totalDays > 0 ? (double) paidDays / totalDays : 1.0;

        // Pro-rate Earnings
        double proratedBasic = Math.round(basic * prorationFactor);
        double proratedHra = Math.round(hra * prorationFactor);
        double proratedDa = Math.round(da * prorationFactor);
        double proratedConveyance = Math.round(conveyance * prorationFactor);
        double proratedMedical = Math.round(medical * prorationFactor);
        double proratedSpecial = Math.round(special * prorationFactor);
        double proratedOtherAllowances = Math.round(otherAllowances * prorationFactor);
        double proratedOtherEarnings = Math.round(otherEarnings * prorationFactor);

        // Fixed / Variable earnings
        double actualBonus = performanceBonus;
        double actualIncentives = incentives;
        
        // Calculate overtime earnings
        double dailyRate = basic / (totalDays > 0 ? totalDays : 30.0);
        double hourlyOvertimeRate = dailyRate / 8.0; // 8 hours work day
        double computedOvertimePay = Math.round(totalOvertimeHours * hourlyOvertimeRate);

        double proratedGross = proratedBasic + proratedHra + proratedDa + 
                proratedConveyance + proratedMedical + proratedSpecial + proratedOtherAllowances + 
                proratedOtherEarnings + actualBonus + actualIncentives + computedOvertimePay;

        // Pro-rate Deductions
        double computedPf = Math.round(proratedBasic * (pfPercent / 100.0));
        double computedEsi = Math.round(proratedGross * (esiPercent / 100.0));
        double computedPT = proratedGross >= 15000.0 ? profTax : 0.0;
        double computedTds = Math.round(proratedGross * (tdsPercent / 100.0));
        
        double proratedInsurance = Math.round(insurance * prorationFactor);
        double proratedAdvance = Math.round(advanceDeduction * prorationFactor);
        double proratedLoan = Math.round(loanDeduction * prorationFactor);
        double proratedOtherDeductions = Math.round(otherDeductions * prorationFactor);
        
        // Dynamic Attendance LOP deduction representation for visual clarity
        double basicAttendanceDeduction = Math.round((basic + hra + da + conveyance + medical + special + otherAllowances + otherEarnings) * (1 - prorationFactor));

        double totalDeductions = computedPf + computedEsi + computedPT + computedTds + 
                proratedInsurance + proratedAdvance + proratedLoan + proratedOtherDeductions;
                
        double netSalary = proratedGross - totalDeductions;

        // Employer Contributions
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
        result.put("incentives", actualIncentives);
        result.put("overtime", computedOvertimePay);
        result.put("otherEarnings", proratedOtherEarnings);

        result.put("providentFund", computedPf);
        result.put("professionalTax", computedPT);
        result.put("incomeTax", computedTds);
        result.put("esi", computedEsi);
        result.put("insurance", proratedInsurance);
        result.put("advanceDeduction", proratedAdvance);
        result.put("loanDeduction", proratedLoan);
        result.put("otherDeductions", proratedOtherDeductions);
        result.put("attendanceDeduction", basicAttendanceDeduction);

        // Policy penalties breakdown
        result.put("lateComingPenalty", Math.round(lateComingPenalty * dailyRate));
        result.put("earlyCheckoutPenalty", Math.round(earlyCheckoutPenalty * dailyRate));
        result.put("missingPunchPenalty", Math.round(missingPunchPenalty * dailyRate));

        result.put("totalDays", totalDays);
        result.put("presentDays", presentDays);
        result.put("absentDays", absentDays);
        result.put("leaveDays", totalLeaveDays - lopLeaveDays);
        result.put("lopDays", totalLopDays);
        result.put("paidDays", paidDays);
        result.put("halfDays", halfDayCount);
        result.put("lateCount", lateCount);
        result.put("lopLeaveDays", lopLeaveDays);
        result.put("weekOffs", weekendDays);
        result.put("holidays", holidays);
        result.put("missingPunches", missingPunches);
        result.put("overtimeHours", totalOvertimeHours);

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
        
        result.put("salaryType", salaryType);
        result.put("paymentMode", paymentMode);
        result.put("payrollFrequency", payrollFrequency);

        return result;
    }

    @Transactional
    public Payroll savePayroll(Payroll payroll, String tenantId) {
        payroll.setTenantId(tenantId);

        // Prevent duplicate payroll generation for the same employee in the same month
        Optional<Payroll> existingOpt = payrollRepository.findByUserIdAndTenantIdAndMonth(
                payroll.getUserId(), tenantId, payroll.getMonth());
                
        if (existingOpt.isPresent()) {
            Payroll existing = existingOpt.get();
            if (!"DRAFT".equalsIgnoreCase(existing.getStatus())) {
                throw new IllegalArgumentException("Payroll record has already been generated and processed for this employee in " + payroll.getMonth() + " (Status: " + existing.getStatus() + ")");
            }
            // Overwrite draft record instead of failing
            payroll.setId(existing.getId());
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
                payroll.getPerformanceBonus() + payroll.getIncentives() + payroll.getOvertime() + payroll.getOtherEarnings();
                
        double deductions = payroll.getProvidentFund() + payroll.getProfessionalTax() + payroll.getIncomeTax() +
                payroll.getEsi() + payroll.getInsurance() + payroll.getAdvanceDeduction() + payroll.getLoanDeduction() +
                payroll.getOtherDeductions() + payroll.getAttendanceDeduction();

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
        
        // Processed payroll should remain immutable unless reversed or manually unlocked
        if ("PAID".equalsIgnoreCase(existing.getStatus()) || "PROCESSED".equalsIgnoreCase(existing.getStatus())) {
            if (!"CANCELLED".equalsIgnoreCase(details.getStatus()) && !"REVERSED".equalsIgnoreCase(details.getStatus())) {
                throw new IllegalStateException("Processed or Paid payrolls are immutable and cannot be updated.");
            }
        }

        existing.setBasicSalary(details.getBasicSalary());
        existing.setHra(details.getHra());
        existing.setConveyanceAllowance(details.getConveyanceAllowance());
        existing.setMedicalAllowance(details.getMedicalAllowance());
        existing.setSpecialAllowance(details.getSpecialAllowance());
        existing.setOtherAllowances(details.getOtherAllowances());
        existing.setPerformanceBonus(details.getPerformanceBonus());
        existing.setIncentives(details.getIncentives());
        existing.setOvertime(details.getOvertime());
        existing.setOtherEarnings(details.getOtherEarnings());

        existing.setProvidentFund(details.getProvidentFund());
        existing.setProfessionalTax(details.getProfessionalTax());
        existing.setIncomeTax(details.getIncomeTax());
        existing.setEsi(details.getEsi());
        existing.setInsurance(details.getInsurance());
        existing.setAdvanceDeduction(details.getAdvanceDeduction());
        existing.setLoanDeduction(details.getLoanDeduction());
        existing.setOtherDeductions(details.getOtherDeductions());
        existing.setAttendanceDeduction(details.getAttendanceDeduction());

        existing.setLateComingPenalty(details.getLateComingPenalty());
        existing.setEarlyCheckoutPenalty(details.getEarlyCheckoutPenalty());
        existing.setMissingPunchPenalty(details.getMissingPunchPenalty());

        existing.setTotalDays(details.getTotalDays());
        existing.setPresentDays(details.getPresentDays());
        existing.setAbsentDays(details.getAbsentDays());
        existing.setLeaveDays(details.getLeaveDays());
        existing.setWeekOffs(details.getWeekOffs());
        existing.setHolidays(details.getHolidays());
        existing.setStatus(details.getStatus());
        
        existing.setUanNumber(details.getUanNumber());
        existing.setPfNumber(details.getPfNumber());
        existing.setEsiNumber(details.getEsiNumber());
        existing.setBankName(details.getBankName());
        existing.setIfscCode(details.getIfscCode());
        existing.setAccountNumber(details.getAccountNumber());
        existing.setLopDays(details.getLopDays());
        existing.setPaidDays(details.getPaidDays());

        existing.setAdjustedManually(details.isAdjustedManually());
        existing.setAuditLog(details.getAuditLog());

        double earnings = details.getBasicSalary() + details.getHra() + details.getConveyanceAllowance() +
                details.getMedicalAllowance() + details.getSpecialAllowance() + details.getOtherAllowances() +
                details.getPerformanceBonus() + details.getIncentives() + details.getOvertime() + details.getOtherEarnings();
                
        double deductions = details.getProvidentFund() + details.getProfessionalTax() + details.getIncomeTax() +
                details.getEsi() + details.getInsurance() + details.getAdvanceDeduction() + details.getLoanDeduction() +
                details.getOtherDeductions() + details.getAttendanceDeduction();

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

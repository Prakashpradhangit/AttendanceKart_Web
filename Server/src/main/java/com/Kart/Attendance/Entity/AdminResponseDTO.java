package com.Kart.Attendance.Entity;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AdminResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String organisationName;
    private String phoneNumber;
    private String slug;
    private LocalDate subscriptionValidity;
    private LocalDate startingDate;
    private String subscriptionYear;
    private long userCount;
}

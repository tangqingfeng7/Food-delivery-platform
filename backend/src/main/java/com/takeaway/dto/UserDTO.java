package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String phone;
    private String email;
    private String avatar;
    private String address;
    private String role;
    private Boolean enabled;
    private java.math.BigDecimal balance;
    private LocalDateTime createdAt;
}

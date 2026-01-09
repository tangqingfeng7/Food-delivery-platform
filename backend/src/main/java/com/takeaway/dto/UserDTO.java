package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
    private String createdAt;
}

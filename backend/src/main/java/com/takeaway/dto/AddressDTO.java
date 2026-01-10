package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 收货地址 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private Long id;

    private Long userId;

    private String name;

    private String phone;

    private String address;

    private Double latitude;

    private Double longitude;

    private Boolean isDefault;

    private String createdAt;
}

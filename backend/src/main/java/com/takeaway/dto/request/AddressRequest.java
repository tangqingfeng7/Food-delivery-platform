package com.takeaway.dto.request;

import lombok.Data;

/**
 * 地址请求 DTO
 */
@Data
public class AddressRequest {

    private String name;

    private String phone;

    private String address;

    private Double latitude;

    private Double longitude;

    private Boolean isDefault;
}

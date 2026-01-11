package com.takeaway.dto.request;

import lombok.Data;

@Data
public class PayOrderRequest {
    private String paymentMethod; // wechat, alipay, balance
}

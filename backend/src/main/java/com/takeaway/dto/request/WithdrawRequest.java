package com.takeaway.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 提现请求DTO
 */
@Data
public class WithdrawRequest {
    
    @NotNull(message = "提现金额不能为空")
    @DecimalMin(value = "0.01", message = "提现金额必须大于0")
    private BigDecimal amount;
    
    // 提现方式：bank-银行卡, wechat-微信, alipay-支付宝
    private String withdrawMethod = "bank";
    
    // 银行卡号（提现到银行卡时必填）
    private String bankAccount;
    
    // 银行名称
    private String bankName;
    
    // 开户人姓名
    private String accountName;
}

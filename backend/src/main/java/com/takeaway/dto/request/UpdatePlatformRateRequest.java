package com.takeaway.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 更新平台抽成比例请求
 */
@Data
public class UpdatePlatformRateRequest {
    
    @NotNull(message = "抽成比例不能为空")
    @DecimalMin(value = "0", message = "抽成比例不能小于0")
    @DecimalMax(value = "100", message = "抽成比例不能大于100")
    private BigDecimal rate;  // 抽成百分比（如 8 表示 8%）
}

package com.takeaway.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * 平台配置 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformConfigDTO {
    
    private BigDecimal defaultPlatformRate;  // 默认平台抽成比例（如 0.08 表示 8%）
    private BigDecimal defaultPlatformRatePercent;  // 默认平台抽成百分比（如 8 表示 8%）
    private String updatedAt;  // 最后更新时间
}

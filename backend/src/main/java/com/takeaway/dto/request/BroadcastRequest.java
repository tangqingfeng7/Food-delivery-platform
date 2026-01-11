package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 广播通知请求 DTO
 */
@Data
public class BroadcastRequest {
    
    @NotBlank(message = "通知标题不能为空")
    private String title;
    
    @NotBlank(message = "通知内容不能为空")
    private String content;
    
    // 通知类型: SYSTEM-系统通知, PROMO-优惠活动
    private String type = "SYSTEM";
}

package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 注销账号请求
 */
@Data
public class DeleteAccountRequest {

    @NotBlank(message = "密码不能为空")
    private String password;

    // 注销原因（可选）
    private String reason;
}

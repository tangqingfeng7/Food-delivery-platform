package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 修改手机号请求
 */
@Data
public class ChangePhoneRequest {

    @NotBlank(message = "当前密码不能为空")
    private String password;

    @NotBlank(message = "新手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请输入有效的手机号")
    private String newPhone;
}

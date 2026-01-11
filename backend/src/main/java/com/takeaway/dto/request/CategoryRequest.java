package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 分类请求 DTO
 */
@Data
public class CategoryRequest {
    
    @NotBlank(message = "分类名称不能为空")
    private String name;
    
    private String icon;
    
    private String color;
    
    private Integer sortOrder = 0;
}

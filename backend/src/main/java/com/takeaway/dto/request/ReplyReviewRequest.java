package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewRequest {
    
    @NotBlank(message = "回复内容不能为空")
    private String content;
}

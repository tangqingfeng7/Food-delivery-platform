package com.takeaway.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateReviewRequest {
    
    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "口味评分不能为空")
    @Min(value = 1, message = "口味评分最低为1分")
    @Max(value = 5, message = "口味评分最高为5分")
    private Integer tasteRating;

    @NotNull(message = "包装评分不能为空")
    @Min(value = 1, message = "包装评分最低为1分")
    @Max(value = 5, message = "包装评分最高为5分")
    private Integer packagingRating;

    @NotNull(message = "配送评分不能为空")
    @Min(value = 1, message = "配送评分最低为1分")
    @Max(value = 5, message = "配送评分最高为5分")
    private Integer deliveryRating;

    private String content;

    private List<String> images;

    private Boolean isAnonymous = false;
}

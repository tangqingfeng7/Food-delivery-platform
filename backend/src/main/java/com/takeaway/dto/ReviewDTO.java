package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Long orderId;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long restaurantId;
    private Integer tasteRating;
    private Integer packagingRating;
    private Integer deliveryRating;
    private BigDecimal overallRating;
    private String content;
    private List<String> images;
    private Boolean isAnonymous;
    private Integer likeCount;
    private Boolean isLiked;
    private String replyContent;
    private LocalDateTime replyTime;
    private LocalDateTime createdAt;
    // 订单商品信息
    private List<OrderItemDTO> orderItems;
}

package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.ReviewDTO;
import com.takeaway.dto.request.CreateReviewRequest;
import com.takeaway.dto.request.ReplyReviewRequest;
import com.takeaway.entity.User;
import com.takeaway.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ==================== 用户评价接口 ====================

    /**
     * 提交评价
     */
    @PostMapping("/reviews")
    public ApiResponse<ReviewDTO> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            ReviewDTO review = reviewService.createReview(user.getId(), request);
            return ApiResponse.success("评价提交成功", review);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取餐厅评价列表
     */
    @GetMapping("/restaurants/{restaurantId}/reviews")
    public ApiResponse<Page<ReviewDTO>> getRestaurantReviews(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = user != null ? user.getId() : null;
        Page<ReviewDTO> reviews = reviewService.getReviewsByRestaurant(restaurantId, userId, page, size);
        return ApiResponse.success(reviews);
    }

    /**
     * 获取餐厅评分统计
     */
    @GetMapping("/restaurants/{restaurantId}/reviews/stats")
    public ApiResponse<Map<String, Object>> getRestaurantReviewStats(@PathVariable Long restaurantId) {
        Map<String, Object> stats = reviewService.getRestaurantRatingStats(restaurantId);
        return ApiResponse.success(stats);
    }

    /**
     * 获取菜品评价列表
     */
    @GetMapping("/menu-items/{menuItemId}/reviews")
    public ApiResponse<Page<ReviewDTO>> getMenuItemReviews(
            @PathVariable Long menuItemId,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = user != null ? user.getId() : null;
        Page<ReviewDTO> reviews = reviewService.getReviewsByMenuItem(menuItemId, userId, page, size);
        return ApiResponse.success(reviews);
    }

    /**
     * 获取菜品评价统计
     */
    @GetMapping("/menu-items/{menuItemId}/reviews/stats")
    public ApiResponse<Map<String, Object>> getMenuItemReviewStats(@PathVariable Long menuItemId) {
        Map<String, Object> stats = reviewService.getMenuItemRatingStats(menuItemId);
        return ApiResponse.success(stats);
    }

    /**
     * 检查订单是否已评价
     */
    @GetMapping("/reviews/check/{orderId}")
    public ApiResponse<Boolean> checkOrderReviewed(@PathVariable Long orderId) {
        boolean reviewed = reviewService.isOrderReviewed(orderId);
        return ApiResponse.success(reviewed);
    }

    /**
     * 获取订单的评价
     */
    @GetMapping("/reviews/order/{orderId}")
    public ApiResponse<ReviewDTO> getOrderReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        try {
            Long userId = user != null ? user.getId() : null;
            ReviewDTO review = reviewService.getReviewByOrder(orderId, userId);
            return ApiResponse.success(review);
        } catch (Exception e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    /**
     * 获取用户的评价列表
     */
    @GetMapping("/reviews/my")
    public ApiResponse<List<ReviewDTO>> getMyReviews(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        List<ReviewDTO> reviews = reviewService.getReviewsByUser(user.getId());
        return ApiResponse.success(reviews);
    }

    /**
     * 点赞评价
     */
    @PostMapping("/reviews/{id}/like")
    public ApiResponse<Void> likeReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            reviewService.likeReview(id, user.getId());
            return ApiResponse.success("点赞成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 取消点赞
     */
    @DeleteMapping("/reviews/{id}/like")
    public ApiResponse<Void> unlikeReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            reviewService.unlikeReview(id, user.getId());
            return ApiResponse.success("已取消点赞", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 商家评价接口 ====================

    /**
     * 商家回复评价
     */
    @PutMapping("/merchant/reviews/{id}/reply")
    public ApiResponse<ReviewDTO> replyReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReplyReviewRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            ReviewDTO review = reviewService.replyReview(id, user.getId(), request);
            return ApiResponse.success("回复成功", review);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}

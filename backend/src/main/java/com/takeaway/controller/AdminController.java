package com.takeaway.controller;

import com.takeaway.dto.*;
import com.takeaway.dto.request.BroadcastRequest;
import com.takeaway.dto.request.CategoryRequest;
import com.takeaway.dto.request.UpdatePlatformRateRequest;
import com.takeaway.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理后台控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ==================== 统计数据 ====================

    /**
     * 获取平台统计数据
     */
    @GetMapping("/statistics")
    public ApiResponse<AdminStatisticsDTO> getStatistics() {
        AdminStatisticsDTO statistics = adminService.getStatistics();
        return ApiResponse.success(statistics);
    }

    // ==================== 用户管理 ====================

    /**
     * 获取用户列表（分页）
     */
    @GetMapping("/users")
    public ApiResponse<PageResult<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        PageResult<UserDTO> result = adminService.getUsers(page, size, keyword, role);
        return ApiResponse.success(result);
    }

    /**
     * 修改用户状态（启用/禁用）
     */
    @PutMapping("/users/{id}/status")
    public ApiResponse<Void> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            return ApiResponse.error(400, "请指定用户状态");
        }
        try {
            adminService.updateUserStatus(id, enabled);
            return ApiResponse.success(enabled ? "用户已启用" : "用户已禁用", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/users/{id}")
    public ApiResponse<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            UserDTO user = adminService.updateUser(id, body);
            return ApiResponse.success("用户信息更新成功", user);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 为用户充值余额
     */
    @PostMapping("/users/{id}/recharge")
    public ApiResponse<UserDTO> rechargeBalance(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Object amountObj = body.get("amount");
        if (amountObj == null) {
            return ApiResponse.error(400, "请指定充值金额");
        }
        try {
            java.math.BigDecimal amount;
            if (amountObj instanceof Number) {
                amount = new java.math.BigDecimal(amountObj.toString());
            } else {
                amount = new java.math.BigDecimal((String) amountObj);
            }
            UserDTO user = adminService.rechargeBalance(id, amount);
            return ApiResponse.success("充值成功", user);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 餐厅管理 ====================

    /**
     * 获取餐厅列表（分页）
     */
    @GetMapping("/restaurants")
    public ApiResponse<PageResult<RestaurantDTO>> getRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResult<RestaurantDTO> result = adminService.getRestaurants(page, size, keyword);
        return ApiResponse.success(result);
    }

    /**
     * 修改餐厅状态（上架/下架）
     */
    @PutMapping("/restaurants/{id}/status")
    public ApiResponse<Void> updateRestaurantStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean isOpen = body.get("isOpen");
        if (isOpen == null) {
            return ApiResponse.error(400, "请指定餐厅状态");
        }
        try {
            adminService.updateRestaurantStatus(id, isOpen);
            return ApiResponse.success(isOpen ? "餐厅已上架" : "餐厅已下架", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新餐厅信息
     */
    @PutMapping("/restaurants/{id}")
    public ApiResponse<RestaurantDTO> updateRestaurant(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            RestaurantDTO restaurant = adminService.updateRestaurant(id, body);
            return ApiResponse.success("餐厅信息更新成功", restaurant);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 订单管理 ====================

    /**
     * 获取订单列表（分页）
     */
    @GetMapping("/orders")
    public ApiResponse<PageResult<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        PageResult<OrderDTO> result = adminService.getOrders(page, size, status, keyword);
        return ApiResponse.success(result);
    }

    /**
     * 修改订单状态
     */
    @PutMapping("/orders/{id}/status")
    public ApiResponse<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ApiResponse.error(400, "请指定订单状态");
        }
        try {
            OrderDTO order = adminService.updateOrderStatus(id, status);
            return ApiResponse.success("订单状态更新成功", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 分类管理 ====================

    /**
     * 获取分类列表
     */
    @GetMapping("/categories")
    public ApiResponse<List<CategoryDTO>> getCategories() {
        List<CategoryDTO> categories = adminService.getCategories();
        return ApiResponse.success(categories);
    }

    /**
     * 新增分类
     */
    @PostMapping("/categories")
    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CategoryRequest request) {
        try {
            CategoryDTO category = adminService.createCategory(request);
            return ApiResponse.success("分类创建成功", category);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新分类
     */
    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        try {
            CategoryDTO category = adminService.updateCategory(id, request);
            return ApiResponse.success("分类更新成功", category);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        try {
            adminService.deleteCategory(id);
            return ApiResponse.success("分类删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 评价管理 ====================

    /**
     * 获取评价列表（分页）
     */
    @GetMapping("/reviews")
    public ApiResponse<PageResult<ReviewDTO>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResult<ReviewDTO> result = adminService.getReviews(page, size, keyword);
        return ApiResponse.success(result);
    }

    /**
     * 删除违规评价
     */
    @DeleteMapping("/reviews/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable Long id) {
        try {
            adminService.deleteReview(id);
            return ApiResponse.success("评价已删除", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 管理员回复评价
     */
    @PutMapping("/reviews/{id}/reply")
    public ApiResponse<ReviewDTO> replyReview(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error(400, "回复内容不能为空");
        }
        try {
            ReviewDTO review = adminService.replyReview(id, content);
            return ApiResponse.success("回复成功", review);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 通知管理 ====================

    /**
     * 发送系统广播通知
     */
    @PostMapping("/notifications/broadcast")
    public ApiResponse<Void> broadcastNotification(@Valid @RequestBody BroadcastRequest request) {
        try {
            adminService.broadcastNotification(request);
            return ApiResponse.success("通知发送成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 平台配置管理 ====================

    /**
     * 获取平台配置（包含默认抽成比例）
     */
    @GetMapping("/config/platform")
    public ApiResponse<PlatformConfigDTO> getPlatformConfig() {
        PlatformConfigDTO config = adminService.getPlatformConfig();
        return ApiResponse.success(config);
    }

    /**
     * 更新默认平台抽成比例
     */
    @PutMapping("/config/platform-rate")
    public ApiResponse<PlatformConfigDTO> updateDefaultPlatformRate(
            @Valid @RequestBody UpdatePlatformRateRequest request) {
        try {
            PlatformConfigDTO config = adminService.updateDefaultPlatformRate(request.getRate());
            return ApiResponse.success("平台抽成比例更新成功", config);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新指定店铺的抽成比例
     */
    @PutMapping("/restaurants/{id}/platform-rate")
    public ApiResponse<RestaurantDTO> updateRestaurantPlatformRate(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePlatformRateRequest request) {
        try {
            RestaurantDTO restaurant = adminService.updateRestaurantPlatformRate(id, request.getRate());
            return ApiResponse.success("店铺抽成比例更新成功", restaurant);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}

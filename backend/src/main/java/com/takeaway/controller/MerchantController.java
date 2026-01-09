package com.takeaway.controller;

import com.takeaway.dto.*;
import com.takeaway.dto.request.*;
import com.takeaway.entity.User;
import com.takeaway.service.MerchantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    // ==================== 店铺管理 ====================

    @GetMapping("/restaurant")
    public ApiResponse<RestaurantDTO> getMyRestaurant(@AuthenticationPrincipal User user) {
        RestaurantDTO restaurant = merchantService.getMyRestaurant(user.getId());
        return ApiResponse.success(restaurant);
    }

    @GetMapping("/restaurant/exists")
    public ApiResponse<Boolean> hasRestaurant(@AuthenticationPrincipal User user) {
        boolean exists = merchantService.hasRestaurant(user.getId());
        return ApiResponse.success(exists);
    }

    @PostMapping("/restaurant")
    public ApiResponse<RestaurantDTO> createRestaurant(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRestaurantRequest request) {
        try {
            RestaurantDTO restaurant = merchantService.createRestaurant(user.getId(), request);
            return ApiResponse.success("店铺创建成功", restaurant);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/restaurant")
    public ApiResponse<RestaurantDTO> updateRestaurant(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateRestaurantRequest request) {
        try {
            RestaurantDTO restaurant = merchantService.updateRestaurant(user.getId(), request);
            return ApiResponse.success("店铺信息更新成功", restaurant);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/restaurant/status")
    public ApiResponse<RestaurantDTO> updateRestaurantStatus(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isOpen = request.get("isOpen");
            RestaurantDTO restaurant = merchantService.updateRestaurantStatus(user.getId(), isOpen);
            return ApiResponse.success(isOpen ? "店铺已开业" : "店铺已休息", restaurant);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 菜品分类管理 ====================

    @GetMapping("/menu-categories")
    public ApiResponse<List<MenuCategoryDTO>> getMenuCategories(@AuthenticationPrincipal User user) {
        try {
            List<MenuCategoryDTO> categories = merchantService.getMenuCategories(user.getId());
            return ApiResponse.success(categories);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/menu-categories")
    public ApiResponse<MenuCategoryDTO> createMenuCategory(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateMenuCategoryRequest request) {
        try {
            MenuCategoryDTO category = merchantService.createMenuCategory(user.getId(), request);
            return ApiResponse.success("分类创建成功", category);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/menu-categories/{id}")
    public ApiResponse<MenuCategoryDTO> updateMenuCategory(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody UpdateMenuCategoryRequest request) {
        try {
            MenuCategoryDTO category = merchantService.updateMenuCategory(user.getId(), id, request);
            return ApiResponse.success("分类更新成功", category);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/menu-categories/{id}")
    public ApiResponse<Void> deleteMenuCategory(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            merchantService.deleteMenuCategory(user.getId(), id);
            return ApiResponse.success("分类删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 菜品管理 ====================

    @GetMapping("/menu-items")
    public ApiResponse<List<MenuItemDTO>> getMenuItems(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long categoryId) {
        try {
            List<MenuItemDTO> items = merchantService.getMenuItems(user.getId(), categoryId);
            return ApiResponse.success(items);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/menu-items")
    public ApiResponse<MenuItemDTO> createMenuItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateMenuItemRequest request) {
        try {
            MenuItemDTO item = merchantService.createMenuItem(user.getId(), request);
            return ApiResponse.success("菜品创建成功", item);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/menu-items/{id}")
    public ApiResponse<MenuItemDTO> updateMenuItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody UpdateMenuItemRequest request) {
        try {
            MenuItemDTO item = merchantService.updateMenuItem(user.getId(), id, request);
            return ApiResponse.success("菜品更新成功", item);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/menu-items/{id}")
    public ApiResponse<Void> deleteMenuItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            merchantService.deleteMenuItem(user.getId(), id);
            return ApiResponse.success("菜品删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/menu-items/{id}/status")
    public ApiResponse<MenuItemDTO> updateMenuItemStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isAvailable = request.get("isAvailable");
            MenuItemDTO item = merchantService.updateMenuItemStatus(user.getId(), id, isAvailable);
            return ApiResponse.success(isAvailable ? "菜品已上架" : "菜品已下架", item);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 订单管理 ====================

    @GetMapping("/orders")
    public ApiResponse<Page<OrderDTO>> getOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<OrderDTO> orders = merchantService.getOrders(user.getId(), status, page, size);
            return ApiResponse.success(orders);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/orders/{id}")
    public ApiResponse<OrderDTO> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            OrderDTO order = merchantService.getOrderById(user.getId(), id);
            return ApiResponse.success(order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/confirm")
    public ApiResponse<OrderDTO> confirmOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            OrderDTO order = merchantService.confirmOrder(user.getId(), id);
            return ApiResponse.success("订单已确认", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/preparing")
    public ApiResponse<OrderDTO> startPreparing(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            OrderDTO order = merchantService.startPreparing(user.getId(), id);
            return ApiResponse.success("开始制作", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/delivering")
    public ApiResponse<OrderDTO> startDelivering(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            OrderDTO order = merchantService.startDelivering(user.getId(), id);
            return ApiResponse.success("开始配送", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/complete")
    public ApiResponse<OrderDTO> completeOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            OrderDTO order = merchantService.completeOrder(user.getId(), id);
            return ApiResponse.success("订单已完成", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 统计数据 ====================

    @GetMapping("/statistics")
    public ApiResponse<MerchantStatisticsDTO> getStatistics(@AuthenticationPrincipal User user) {
        try {
            MerchantStatisticsDTO statistics = merchantService.getStatistics(user.getId());
            return ApiResponse.success(statistics);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}

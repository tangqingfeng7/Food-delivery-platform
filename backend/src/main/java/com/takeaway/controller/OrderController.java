package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.OrderDTO;
import com.takeaway.dto.request.CreateOrderRequest;
import com.takeaway.entity.User;
import com.takeaway.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderDTO> createOrder(@AuthenticationPrincipal User user,
                                             @Valid @RequestBody CreateOrderRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            OrderDTO order = orderService.createOrder(user.getId(), request);
            return ApiResponse.success("订单创建成功", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<Page<OrderDTO>> getOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        Page<OrderDTO> orders = orderService.getOrders(user.getId(), status, page, size);
        return ApiResponse.success(orders);
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDTO> getOrderById(@PathVariable Long id) {
        try {
            OrderDTO order = orderService.getOrderById(id);
            return ApiResponse.success(order);
        } catch (Exception e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<OrderDTO> cancelOrder(@PathVariable Long id) {
        try {
            OrderDTO order = orderService.cancelOrder(id);
            return ApiResponse.success("订单已取消", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<OrderDTO> confirmOrder(@PathVariable Long id) {
        try {
            OrderDTO order = orderService.confirmOrder(id);
            return ApiResponse.success("已确认收货", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}/pay")
    public ApiResponse<OrderDTO> payOrder(@PathVariable Long id) {
        try {
            OrderDTO order = orderService.payOrder(id);
            return ApiResponse.success("支付成功", order);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}

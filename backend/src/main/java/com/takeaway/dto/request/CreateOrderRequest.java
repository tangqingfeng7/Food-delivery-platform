package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "餐厅ID不能为空")
    private Long restaurantId;

    @NotEmpty(message = "商品列表不能为空")
    private List<OrderItemRequest> items;

    @NotBlank(message = "配送地址不能为空")
    private String address;

    @NotBlank(message = "联系电话不能为空")
    private String phone;

    private String remark;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "菜品ID不能为空")
        private Long menuItemId;

        @NotNull(message = "数量不能为空")
        private Integer quantity;
    }
}

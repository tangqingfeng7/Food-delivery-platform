package com.takeaway.service;

import com.takeaway.dto.OrderDTO;
import com.takeaway.dto.OrderItemDTO;
import com.takeaway.dto.request.CreateOrderRequest;
import com.takeaway.entity.*;
import com.takeaway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final WebSocketService webSocketService;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public OrderDTO createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));

        // 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setAddress(request.getAddress());
        order.setPhone(request.getPhone());
        order.setRemark(request.getRemark());
        order.setDeliveryFee(restaurant.getDeliveryFee());
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setStatus(Order.OrderStatus.PENDING);

        // 计算总价并创建订单项
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("菜品不存在: " + itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setMenuItemName(menuItem.getName());
            orderItem.setMenuItemImage(menuItem.getImage());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());

            order.getItems().add(orderItem);

            totalAmount = totalAmount.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            // 更新销量
            menuItem.setSales(menuItem.getSales() + itemRequest.getQuantity());
            menuItemRepository.save(menuItem);
        }

        order.setTotalAmount(totalAmount);
        order.setPayAmount(totalAmount.add(order.getDeliveryFee()).subtract(order.getDiscountAmount()));

        Order savedOrder = orderRepository.save(order);
        return toDTO(savedOrder);
    }

    public Page<OrderDTO> getOrders(Long userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;

        if (status != null && !status.isEmpty() && !status.equals("all")) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, orderStatus, pageable);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return orders.map(this::toDTO);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        return toDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PAID) {
            throw new RuntimeException("当前状态不允许取消订单");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        
        // 推送订单状态更新消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);
        
        return toDTO(savedOrder);
    }

    @Transactional
    public OrderDTO confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.DELIVERING) {
            throw new RuntimeException("当前状态不允许确认收货");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        
        // 推送订单状态更新消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);
        
        return toDTO(savedOrder);
    }

    @Transactional
    public OrderDTO payOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("当前状态不允许支付");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        
        // 推送订单状态更新消息给用户
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);
        
        // 推送新订单通知给商家
        webSocketService.sendNewOrderNotification(savedOrder);
        
        return toDTO(savedOrder);
    }
    
    /**
     * 更新订单状态（商家操作）
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        String oldStatus = order.getStatus().name();
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
        order.setStatus(newStatus);
        
        // 根据状态更新相关时间
        if (newStatus == Order.OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        } else if (newStatus == Order.OrderStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // 推送订单状态更新消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);
        
        return toDTO(savedOrder);
    }

    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setUserId(order.getUser().getId());
        dto.setRestaurantId(order.getRestaurant().getId());
        dto.setRestaurantName(order.getRestaurant().getName());
        dto.setRestaurantImage(order.getRestaurant().getImage());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setPayAmount(order.getPayAmount());
        dto.setStatus(order.getStatus().name());
        dto.setAddress(order.getAddress());
        dto.setPhone(order.getPhone());
        dto.setRemark(order.getRemark());
        dto.setDeliveryTime(order.getDeliveryTime() != null ? order.getDeliveryTime().format(DATETIME_FORMATTER) : null);
        dto.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().format(DATETIME_FORMATTER) : null);
        dto.setUpdatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().format(DATETIME_FORMATTER) : null);

        List<OrderItemDTO> items = order.getItems().stream()
                .map(this::toOrderItemDTO)
                .collect(Collectors.toList());
        dto.setItems(items);

        return dto;
    }

    private OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setMenuItemId(orderItem.getMenuItem().getId());
        dto.setMenuItemName(orderItem.getMenuItemName());
        dto.setMenuItemImage(orderItem.getMenuItemImage());
        dto.setPrice(orderItem.getPrice());
        dto.setQuantity(orderItem.getQuantity());
        return dto;
    }
}

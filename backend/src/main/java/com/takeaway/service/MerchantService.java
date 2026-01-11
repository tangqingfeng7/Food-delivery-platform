package com.takeaway.service;

import com.takeaway.dto.*;
import com.takeaway.dto.request.*;
import com.takeaway.entity.*;
import com.takeaway.entity.SystemConfig;
import com.takeaway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MerchantService {

    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final BigDecimal FALLBACK_PLATFORM_RATE = BigDecimal.valueOf(0.08);  // 兜底默认值

    /**
     * 获取默认平台抽成比例（从系统配置表读取）
     */
    private BigDecimal getDefaultPlatformRate() {
        return systemConfigRepository.findByConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE)
                .map(SystemConfig::getValueAsBigDecimal)
                .orElse(FALLBACK_PLATFORM_RATE);
    }

    // ==================== 店铺管理 ====================

    public RestaurantDTO getMyRestaurant(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElse(null);
        return restaurant != null ? toRestaurantDTO(restaurant) : null;
    }

    public boolean hasRestaurant(Long ownerId) {
        return restaurantRepository.existsByOwnerId(ownerId);
    }

    @Transactional
    public RestaurantDTO createRestaurant(Long ownerId, CreateRestaurantRequest request) {
        if (restaurantRepository.existsByOwnerId(ownerId)) {
            throw new RuntimeException("您已经创建过店铺");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("分类不存在"));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setImage(request.getImage());
        restaurant.setLogo(request.getLogo());
        restaurant.setDeliveryTime(request.getDeliveryTime() != null ? request.getDeliveryTime() : "30-45");
        restaurant.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO);
        restaurant.setMinOrder(request.getMinOrder() != null ? request.getMinOrder() : BigDecimal.ZERO);
        restaurant.setAddress(request.getAddress());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        restaurant.setPhone(request.getPhone());
        restaurant.setCategory(category);
        restaurant.setOwner(owner);
        restaurant.setTags(request.getTags());
        restaurant.setIsOpen(true);
        restaurant.setIsNew(true);
        restaurant.setDistance(BigDecimal.ZERO);

        if (request.getOpenTime() != null) {
            restaurant.setOpenTime(LocalTime.parse(request.getOpenTime(), TIME_FORMATTER));
        } else {
            restaurant.setOpenTime(LocalTime.of(9, 0));
        }
        if (request.getCloseTime() != null) {
            restaurant.setCloseTime(LocalTime.parse(request.getCloseTime(), TIME_FORMATTER));
        } else {
            restaurant.setCloseTime(LocalTime.of(22, 0));
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return toRestaurantDTO(savedRestaurant);
    }

    @Transactional
    public RestaurantDTO updateRestaurant(Long ownerId, UpdateRestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        if (request.getName() != null) {
            restaurant.setName(request.getName());
        }
        if (request.getDescription() != null) {
            restaurant.setDescription(request.getDescription());
        }
        if (request.getImage() != null) {
            restaurant.setImage(request.getImage());
        }
        if (request.getLogo() != null) {
            restaurant.setLogo(request.getLogo());
        }
        if (request.getDeliveryTime() != null) {
            restaurant.setDeliveryTime(request.getDeliveryTime());
        }
        if (request.getDeliveryFee() != null) {
            restaurant.setDeliveryFee(request.getDeliveryFee());
        }
        if (request.getMinOrder() != null) {
            restaurant.setMinOrder(request.getMinOrder());
        }
        if (request.getAddress() != null) {
            restaurant.setAddress(request.getAddress());
        }
        if (request.getLatitude() != null) {
            restaurant.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            restaurant.setLongitude(request.getLongitude());
        }
        if (request.getPhone() != null) {
            restaurant.setPhone(request.getPhone());
        }
        if (request.getOpenTime() != null) {
            restaurant.setOpenTime(LocalTime.parse(request.getOpenTime(), TIME_FORMATTER));
        }
        if (request.getCloseTime() != null) {
            restaurant.setCloseTime(LocalTime.parse(request.getCloseTime(), TIME_FORMATTER));
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            restaurant.setCategory(category);
        }
        if (request.getTags() != null) {
            restaurant.setTags(request.getTags());
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return toRestaurantDTO(savedRestaurant);
    }

    @Transactional
    public RestaurantDTO updateRestaurantStatus(Long ownerId, Boolean isOpen) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        restaurant.setIsOpen(isOpen);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return toRestaurantDTO(savedRestaurant);
    }

    // ==================== 菜品分类管理 ====================

    public List<MenuCategoryDTO> getMenuCategories(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        return menuCategoryRepository.findByRestaurantIdOrderBySortOrderAsc(restaurant.getId())
                .stream()
                .map(this::toMenuCategoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuCategoryDTO createMenuCategory(Long ownerId, CreateMenuCategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuCategory category = new MenuCategory();
        category.setRestaurant(restaurant);
        category.setName(request.getName());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        MenuCategory savedCategory = menuCategoryRepository.save(category);
        return toMenuCategoryDTO(savedCategory);
    }

    @Transactional
    public MenuCategoryDTO updateMenuCategory(Long ownerId, Long categoryId, UpdateMenuCategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));

        if (!category.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此分类");
        }

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        MenuCategory savedCategory = menuCategoryRepository.save(category);
        return toMenuCategoryDTO(savedCategory);
    }

    @Transactional
    public void deleteMenuCategory(Long ownerId, Long categoryId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));

        if (!category.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此分类");
        }

        // 检查是否有菜品关联
        Long itemCount = menuItemRepository.countByMenuCategoryId(categoryId);
        if (itemCount > 0) {
            throw new RuntimeException("该分类下还有菜品，无法删除");
        }

        menuCategoryRepository.delete(category);
    }

    // ==================== 菜品管理 ====================

    public List<MenuItemDTO> getMenuItems(Long ownerId, Long categoryId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        List<MenuItem> items;
        if (categoryId != null) {
            items = menuItemRepository.findByRestaurantIdAndMenuCategoryIdOrderBySortOrderAsc(restaurant.getId(), categoryId);
        } else {
            items = menuItemRepository.findByRestaurantIdOrderBySortOrderAsc(restaurant.getId());
        }

        return items.stream()
                .map(this::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuItemDTO createMenuItem(Long ownerId, CreateMenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurant(restaurant);
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setOriginalPrice(request.getOriginalPrice());
        menuItem.setImage(request.getImage());
        menuItem.setIsHot(request.getIsHot() != null ? request.getIsHot() : false);
        menuItem.setIsNew(request.getIsNew() != null ? request.getIsNew() : false);
        menuItem.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        menuItem.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        menuItem.setSales(0);

        if (request.getCategoryId() != null) {
            MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("菜品分类不存在"));
            if (!category.getRestaurant().getId().equals(restaurant.getId())) {
                throw new RuntimeException("无效的菜品分类");
            }
            menuItem.setMenuCategory(category);
        }

        MenuItem savedItem = menuItemRepository.save(menuItem);
        return toMenuItemDTO(savedItem);
    }

    @Transactional
    public MenuItemDTO updateMenuItem(Long ownerId, Long itemId, UpdateMenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));

        if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此菜品");
        }

        if (request.getName() != null) {
            menuItem.setName(request.getName());
        }
        if (request.getDescription() != null) {
            menuItem.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            menuItem.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            menuItem.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getImage() != null) {
            menuItem.setImage(request.getImage());
        }
        if (request.getIsHot() != null) {
            menuItem.setIsHot(request.getIsHot());
        }
        if (request.getIsNew() != null) {
            menuItem.setIsNew(request.getIsNew());
        }
        if (request.getIsAvailable() != null) {
            menuItem.setIsAvailable(request.getIsAvailable());
        }
        if (request.getSortOrder() != null) {
            menuItem.setSortOrder(request.getSortOrder());
        }
        if (request.getCategoryId() != null) {
            MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("菜品分类不存在"));
            if (!category.getRestaurant().getId().equals(restaurant.getId())) {
                throw new RuntimeException("无效的菜品分类");
            }
            menuItem.setMenuCategory(category);
        }

        MenuItem savedItem = menuItemRepository.save(menuItem);
        return toMenuItemDTO(savedItem);
    }

    @Transactional
    public void deleteMenuItem(Long ownerId, Long itemId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));

        if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此菜品");
        }

        menuItemRepository.delete(menuItem);
    }

    @Transactional
    public MenuItemDTO updateMenuItemStatus(Long ownerId, Long itemId, Boolean isAvailable) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));

        if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此菜品");
        }

        menuItem.setIsAvailable(isAvailable);
        MenuItem savedItem = menuItemRepository.save(menuItem);
        return toMenuItemDTO(savedItem);
    }

    // ==================== 订单管理 ====================

    public Page<OrderDTO> getOrders(Long ownerId, String status, int page, int size) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;

        if (status != null && !status.isEmpty() && !status.equals("all")) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            orders = orderRepository.findByRestaurantIdAndStatusOrderByCreatedAtDesc(restaurant.getId(), orderStatus, pageable);
        } else {
            // 商家端"全部"订单排除待支付状态（商家不需要处理未付款订单）
            orders = orderRepository.findByRestaurantIdAndStatusNotOrderByCreatedAtDesc(
                    restaurant.getId(), Order.OrderStatus.PENDING, pageable);
        }

        return orders.map(this::toOrderDTO);
    }

    public OrderDTO getOrderById(Long ownerId, Long orderId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权查看此订单");
        }

        return toOrderDTO(order);
    }

    @Transactional
    public OrderDTO confirmOrder(Long ownerId, Long orderId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != Order.OrderStatus.PAID) {
            throw new RuntimeException("当前状态不允许确认订单");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.CONFIRMED);
        Order savedOrder = orderRepository.save(order);

        // 发送通知给用户
        notificationService.createNotification(
                order.getUser().getId(),
                "订单已确认",
                "您的订单 " + order.getOrderNo() + " 已被商家确认，即将开始制作",
                Notification.NotificationType.ORDER,
                order.getId()
        );
        
        // 推送 WebSocket 消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);

        return toOrderDTO(savedOrder);
    }

    @Transactional
    public OrderDTO startPreparing(Long ownerId, Long orderId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("当前状态不允许开始制作");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.PREPARING);
        Order savedOrder = orderRepository.save(order);

        // 发送通知给用户
        notificationService.createNotification(
                order.getUser().getId(),
                "订单制作中",
                "您的订单 " + order.getOrderNo() + " 正在制作中，请耐心等待",
                Notification.NotificationType.ORDER,
                order.getId()
        );
        
        // 推送 WebSocket 消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);

        return toOrderDTO(savedOrder);
    }

    @Transactional
    public OrderDTO startDelivering(Long ownerId, Long orderId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != Order.OrderStatus.PREPARING) {
            throw new RuntimeException("当前状态不允许开始配送");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.DELIVERING);
        order.setDeliveryTime(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // 发送通知给用户
        notificationService.createNotification(
                order.getUser().getId(),
                "订单配送中",
                "您的订单 " + order.getOrderNo() + " 已开始配送，请注意查收",
                Notification.NotificationType.ORDER,
                order.getId()
        );
        
        // 推送 WebSocket 消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);

        return toOrderDTO(savedOrder);
    }

    @Transactional
    public OrderDTO completeOrder(Long ownerId, Long orderId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERING) {
            throw new RuntimeException("当前状态不允许完成订单");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // 发送通知给用户
        notificationService.createNotification(
                order.getUser().getId(),
                "订单已完成",
                "您的订单 " + order.getOrderNo() + " 已完成，感谢您的惠顾！",
                Notification.NotificationType.ORDER,
                order.getId()
        );
        
        // 推送 WebSocket 消息
        webSocketService.sendOrderStatusUpdate(savedOrder, oldStatus);

        return toOrderDTO(savedOrder);
    }

    // ==================== 统计数据 ====================

    public MerchantStatisticsDTO getStatistics(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        Long restaurantId = restaurant.getId();

        MerchantStatisticsDTO dto = new MerchantStatisticsDTO();

        // 今日统计
        dto.setTodayOrders(orderRepository.countTodayOrdersByRestaurantId(restaurantId));
        BigDecimal todayRevenue = orderRepository.sumTodayPayAmountByRestaurantId(restaurantId);
        dto.setTodayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        
        // 今日实际收入（扣除平台抽成后）
        BigDecimal todayIncome = orderRepository.sumTodayMerchantIncomeByRestaurantId(restaurantId);
        dto.setTodayIncome(todayIncome != null ? todayIncome : BigDecimal.ZERO);
        dto.setTodayPlatformFee(dto.getTodayRevenue().subtract(dto.getTodayIncome()));

        // 总计统计
        dto.setTotalOrders(orderRepository.countByRestaurantId(restaurantId));
        BigDecimal totalRevenue = orderRepository.sumPayAmountByRestaurantId(restaurantId);
        dto.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // 实际总收入（扣除平台抽成后）
        BigDecimal totalIncome = orderRepository.sumMerchantIncomeByRestaurantId(restaurantId);
        dto.setTotalIncome(totalIncome != null ? totalIncome : BigDecimal.ZERO);
        dto.setTotalPlatformFee(dto.getTotalRevenue().subtract(dto.getTotalIncome()));

        // 平台抽成比例（优先使用餐厅设置，否则使用系统默认配置）
        BigDecimal rate = restaurant.getPlatformRate() != null ? restaurant.getPlatformRate() : getDefaultPlatformRate();
        dto.setPlatformRate(rate);
        dto.setPlatformRatePercent(rate.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));

        // 订单状态统计
        dto.setPendingOrders(orderRepository.countByRestaurantIdAndStatus(restaurantId, Order.OrderStatus.PENDING));
        dto.setPaidOrders(orderRepository.countByRestaurantIdAndStatus(restaurantId, Order.OrderStatus.PAID));
        dto.setPreparingOrders(orderRepository.countByRestaurantIdAndStatus(restaurantId, Order.OrderStatus.PREPARING));
        dto.setDeliveringOrders(orderRepository.countByRestaurantIdAndStatus(restaurantId, Order.OrderStatus.DELIVERING));
        dto.setCompletedOrders(orderRepository.countByRestaurantIdAndStatus(restaurantId, Order.OrderStatus.COMPLETED));

        // 菜品统计
        List<MenuItem> allItems = menuItemRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId);
        dto.setTotalMenuItems((long) allItems.size());
        dto.setAvailableMenuItems(allItems.stream().filter(MenuItem::getIsAvailable).count());

        return dto;
    }

    // ==================== 余额与提现 ====================

    /**
     * 获取店铺余额
     */
    public BigDecimal getBalance(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));
        return restaurant.getBalance() != null ? restaurant.getBalance() : BigDecimal.ZERO;
    }

    /**
     * 店铺提现（预留接口）
     * @param ownerId 店铺所有者ID
     * @param amount 提现金额
     * @return 提现后的余额
     */
    @Transactional
    public BigDecimal withdraw(Long ownerId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("提现金额必须大于0");
        }

        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("店铺不存在"));

        BigDecimal currentBalance = restaurant.getBalance() != null ? restaurant.getBalance() : BigDecimal.ZERO;
        
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("余额不足，当前余额: " + currentBalance + "，提现金额: " + amount);
        }

        // 扣除余额
        restaurant.setBalance(currentBalance.subtract(amount));
        restaurantRepository.save(restaurant);

        // TODO: 这里预留真实提现逻辑
        // 1. 记录提现流水
        // 2. 调用第三方支付接口进行转账
        // 3. 发送提现通知

        return restaurant.getBalance();
    }

    // ==================== DTO转换 ====================

    private RestaurantDTO toRestaurantDTO(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setImage(restaurant.getImage());
        dto.setLogo(restaurant.getLogo());
        dto.setRating(restaurant.getRating());
        dto.setReviewCount(restaurant.getReviewCount());
        dto.setDeliveryTime(restaurant.getDeliveryTime());
        dto.setDeliveryFee(restaurant.getDeliveryFee());
        dto.setMinOrder(restaurant.getMinOrder());
        dto.setDistance(restaurant.getDistance());
        dto.setAddress(restaurant.getAddress());
        dto.setLatitude(restaurant.getLatitude());
        dto.setLongitude(restaurant.getLongitude());
        dto.setPhone(restaurant.getPhone());
        dto.setOpenTime(restaurant.getOpenTime() != null ? restaurant.getOpenTime().format(TIME_FORMATTER) : null);
        dto.setCloseTime(restaurant.getCloseTime() != null ? restaurant.getCloseTime().format(TIME_FORMATTER) : null);
        dto.setIsOpen(restaurant.getIsOpen());
        dto.setIsNew(restaurant.getIsNew());

        if (restaurant.getCategory() != null) {
            dto.setCategoryId(restaurant.getCategory().getId());
            dto.setCategoryName(restaurant.getCategory().getName());
        }

        if (restaurant.getTags() != null && !restaurant.getTags().isEmpty()) {
            dto.setTags(Arrays.asList(restaurant.getTags().split(",")));
        } else {
            dto.setTags(Collections.emptyList());
        }

        dto.setBalance(restaurant.getBalance());
        // 平台抽成比例（优先使用餐厅设置，否则使用系统默认配置）
        BigDecimal rate = restaurant.getPlatformRate() != null ? restaurant.getPlatformRate() : getDefaultPlatformRate();
        dto.setPlatformRate(rate);
        dto.setPlatformRatePercent(rate.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        dto.setCreatedAt(restaurant.getCreatedAt() != null ? restaurant.getCreatedAt().format(DATETIME_FORMATTER) : null);
        return dto;
    }

    private MenuCategoryDTO toMenuCategoryDTO(MenuCategory menuCategory) {
        MenuCategoryDTO dto = new MenuCategoryDTO();
        dto.setId(menuCategory.getId());
        dto.setRestaurantId(menuCategory.getRestaurant().getId());
        dto.setName(menuCategory.getName());
        dto.setSortOrder(menuCategory.getSortOrder());
        dto.setItemCount(menuItemRepository.countByMenuCategoryId(menuCategory.getId()));
        return dto;
    }

    private MenuItemDTO toMenuItemDTO(MenuItem menuItem) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(menuItem.getId());
        dto.setRestaurantId(menuItem.getRestaurant().getId());
        dto.setName(menuItem.getName());
        dto.setDescription(menuItem.getDescription());
        dto.setPrice(menuItem.getPrice());
        dto.setOriginalPrice(menuItem.getOriginalPrice());
        dto.setImage(menuItem.getImage());

        if (menuItem.getMenuCategory() != null) {
            dto.setCategoryId(menuItem.getMenuCategory().getId());
            dto.setCategoryName(menuItem.getMenuCategory().getName());
        }

        dto.setSales(menuItem.getSales());
        dto.setIsHot(menuItem.getIsHot());
        dto.setIsNew(menuItem.getIsNew());
        dto.setIsAvailable(menuItem.getIsAvailable());
        return dto;
    }

    private OrderDTO toOrderDTO(Order order) {
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
        dto.setPlatformFee(order.getPlatformFee());
        dto.setPlatformRate(order.getPlatformRate());
        dto.setMerchantIncome(order.getMerchantIncome());
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

package com.takeaway.service;

import com.takeaway.dto.*;
import com.takeaway.dto.request.BroadcastRequest;
import com.takeaway.dto.request.CategoryRequest;
import com.takeaway.entity.*;
import com.takeaway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 管理后台服务
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final SystemConfigRepository systemConfigRepository;

    // 兜底默认平台抽成比例（当系统配置表无数据时使用）
    private static final BigDecimal FALLBACK_PLATFORM_RATE = BigDecimal.valueOf(0.08);
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 获取平台统计数据
     */
    public AdminStatisticsDTO getStatistics() {
        // 平台收入统计
        BigDecimal totalPlatformIncome = orderRepository.sumTotalPlatformFee();
        BigDecimal todayPlatformIncome = orderRepository.sumTodayPlatformFee();
        
        return AdminStatisticsDTO.builder()
                // 用户统计
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByEnabledTrue())
                .newUsersToday(userRepository.countTodayRegistered())
                // 餐厅统计
                .totalRestaurants(restaurantRepository.count())
                .openRestaurants(restaurantRepository.countByIsOpenTrue())
                .newRestaurantsToday(restaurantRepository.countTodayCreated())
                // 订单统计
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countPending())
                .completedOrdersToday(orderRepository.countTodayCompleted())
                // 营收统计
                .totalRevenue(orderRepository.sumTotalRevenue())
                .todayRevenue(orderRepository.sumTodayRevenue())
                // 平台收入统计
                .totalPlatformIncome(totalPlatformIncome != null ? totalPlatformIncome : BigDecimal.ZERO)
                .todayPlatformIncome(todayPlatformIncome != null ? todayPlatformIncome : BigDecimal.ZERO)
                // 评价统计
                .totalReviews(reviewRepository.count())
                .newReviewsToday(reviewRepository.countTodayCreated())
                .build();
    }

    // ==================== 平台配置管理 ====================

    /**
     * 获取默认平台抽成比例
     */
    public BigDecimal getDefaultPlatformRate() {
        return systemConfigRepository.findByConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE)
                .map(SystemConfig::getValueAsBigDecimal)
                .orElse(FALLBACK_PLATFORM_RATE);
    }

    /**
     * 获取平台配置
     */
    public PlatformConfigDTO getPlatformConfig() {
        SystemConfig config = systemConfigRepository.findByConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE)
                .orElse(null);
        
        BigDecimal rate = config != null ? config.getValueAsBigDecimal() : FALLBACK_PLATFORM_RATE;
        BigDecimal ratePercent = rate.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        
        return PlatformConfigDTO.builder()
                .defaultPlatformRate(rate)
                .defaultPlatformRatePercent(ratePercent)
                .updatedAt(config != null && config.getUpdatedAt() != null 
                        ? config.getUpdatedAt().format(DATETIME_FORMATTER) : null)
                .build();
    }

    /**
     * 更新默认平台抽成比例
     * @param ratePercent 抽成百分比（如 8 表示 8%）
     */
    @Transactional
    public PlatformConfigDTO updateDefaultPlatformRate(BigDecimal ratePercent) {
        if (ratePercent.compareTo(BigDecimal.ZERO) < 0 || ratePercent.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("抽成比例必须在 0-100 之间");
        }

        // 转换为小数形式（如 8% -> 0.08）
        BigDecimal rate = ratePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        SystemConfig config = systemConfigRepository.findByConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE);
                    newConfig.setConfigDesc("默认平台抽成比例");
                    return newConfig;
                });

        config.setConfigValue(rate.toPlainString());
        systemConfigRepository.save(config);

        return getPlatformConfig();
    }

    /**
     * 更新指定店铺的抽成比例
     * @param restaurantId 店铺ID
     * @param ratePercent 抽成百分比（如 8 表示 8%）
     */
    @Transactional
    public RestaurantDTO updateRestaurantPlatformRate(Long restaurantId, BigDecimal ratePercent) {
        if (ratePercent.compareTo(BigDecimal.ZERO) < 0 || ratePercent.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("抽成比例必须在 0-100 之间");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));

        // 转换为小数形式（如 8% -> 0.08）
        BigDecimal rate = ratePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        restaurant.setPlatformRate(rate);
        
        restaurantRepository.save(restaurant);
        return convertToRestaurantDTO(restaurant);
    }

    // ==================== 用户管理 ====================

    /**
     * 获取用户列表（分页）
     */
    public PageResult<UserDTO> getUsers(int page, int size, String keyword, String role) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage;

        if (keyword != null && !keyword.isEmpty()) {
            if (role != null && !role.isEmpty()) {
                userPage = userRepository.searchByRoleAndKeyword(role, keyword, pageable);
            } else {
                userPage = userRepository.searchByKeyword(keyword, pageable);
            }
        } else if (role != null && !role.isEmpty()) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserDTO> users = userPage.getContent().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());

        return PageResult.<UserDTO>builder()
                .content(users)
                .page(page)
                .size(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }

    /**
     * 修改用户状态（启用/禁用）
     */
    @Transactional
    public void updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public UserDTO updateUser(Long userId, java.util.Map<String, Object> data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 更新用户名
        if (data.containsKey("username")) {
            String newUsername = (String) data.get("username");
            if (newUsername != null && !newUsername.equals(user.getUsername())) {
                // 检查用户名是否已存在
                if (userRepository.findByUsername(newUsername).isPresent()) {
                    throw new RuntimeException("该用户名已被使用");
                }
                user.setUsername(newUsername);
            }
        }

        // 更新手机号
        if (data.containsKey("phone")) {
            String newPhone = (String) data.get("phone");
            if (newPhone != null && !newPhone.equals(user.getPhone())) {
                // 检查手机号是否已存在
                if (userRepository.findByPhone(newPhone).isPresent()) {
                    throw new RuntimeException("该手机号已被使用");
                }
                user.setPhone(newPhone);
            }
        }

        // 更新邮箱
        if (data.containsKey("email")) {
            user.setEmail((String) data.get("email"));
        }

        // 更新角色
        if (data.containsKey("role")) {
            String newRole = (String) data.get("role");
            if (newRole != null && (newRole.equals("USER") || newRole.equals("MERCHANT") || newRole.equals("ADMIN"))) {
                user.setRole(newRole);
            }
        }

        // 更新状态
        if (data.containsKey("enabled")) {
            user.setEnabled((Boolean) data.get("enabled"));
        }

        User savedUser = userRepository.save(user);
        return convertToUserDTO(savedUser);
    }

    /**
     * 为用户充值余额
     */
    @Transactional
    public UserDTO rechargeBalance(Long userId, java.math.BigDecimal amount) {
        if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("充值金额必须大于0");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        java.math.BigDecimal currentBalance = user.getBalance();
        if (currentBalance == null) {
            currentBalance = java.math.BigDecimal.ZERO;
        }
        
        user.setBalance(currentBalance.add(amount));
        User savedUser = userRepository.save(user);
        return convertToUserDTO(savedUser);
    }

    // ==================== 餐厅管理 ====================

    /**
     * 获取餐厅列表（分页）
     */
    public PageResult<RestaurantDTO> getRestaurants(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Restaurant> restaurantPage;

        if (keyword != null && !keyword.isEmpty()) {
            restaurantPage = restaurantRepository.searchByKeyword(keyword, pageable);
        } else {
            restaurantPage = restaurantRepository.findAllOrderByCreatedAtDesc(pageable);
        }

        List<RestaurantDTO> restaurants = restaurantPage.getContent().stream()
                .map(this::convertToRestaurantDTO)
                .collect(Collectors.toList());

        return PageResult.<RestaurantDTO>builder()
                .content(restaurants)
                .page(page)
                .size(size)
                .totalElements(restaurantPage.getTotalElements())
                .totalPages(restaurantPage.getTotalPages())
                .first(restaurantPage.isFirst())
                .last(restaurantPage.isLast())
                .build();
    }

    /**
     * 修改餐厅状态（上架/下架）
     */
    @Transactional
    public void updateRestaurantStatus(Long restaurantId, boolean isOpen) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));
        restaurant.setIsOpen(isOpen);
        restaurantRepository.save(restaurant);
    }

    /**
     * 更新餐厅信息
     */
    @Transactional
    public RestaurantDTO updateRestaurant(Long restaurantId, java.util.Map<String, Object> data) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));

        // 更新餐厅名称
        if (data.containsKey("name")) {
            restaurant.setName((String) data.get("name"));
        }

        // 更新描述
        if (data.containsKey("description")) {
            restaurant.setDescription((String) data.get("description"));
        }

        // 更新地址
        if (data.containsKey("address")) {
            restaurant.setAddress((String) data.get("address"));
        }

        // 更新电话
        if (data.containsKey("phone")) {
            restaurant.setPhone((String) data.get("phone"));
        }

        // 更新配送费
        if (data.containsKey("deliveryFee")) {
            Object value = data.get("deliveryFee");
            if (value instanceof Number) {
                restaurant.setDeliveryFee(java.math.BigDecimal.valueOf(((Number) value).doubleValue()));
            }
        }

        // 更新起送价
        if (data.containsKey("minOrder")) {
            Object value = data.get("minOrder");
            if (value instanceof Number) {
                restaurant.setMinOrder(java.math.BigDecimal.valueOf(((Number) value).doubleValue()));
            }
        }

        // 更新配送时间
        if (data.containsKey("deliveryTime")) {
            restaurant.setDeliveryTime((String) data.get("deliveryTime"));
        }

        // 更新分类
        if (data.containsKey("categoryId")) {
            Object value = data.get("categoryId");
            if (value instanceof Number) {
                Long categoryId = ((Number) value).longValue();
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("分类不存在"));
                restaurant.setCategory(category);
            }
        }

        // 更新是否推荐
        if (data.containsKey("isFeatured")) {
            restaurant.setIsFeatured((Boolean) data.get("isFeatured"));
        }

        // 更新是否营业
        if (data.containsKey("isOpen")) {
            restaurant.setIsOpen((Boolean) data.get("isOpen"));
        }

        // 更新标签
        if (data.containsKey("tags")) {
            restaurant.setTags((String) data.get("tags"));
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return convertToRestaurantDTO(savedRestaurant);
    }

    // ==================== 订单管理 ====================

    /**
     * 获取订单列表（分页）
     */
    public PageResult<OrderDTO> getOrders(int page, int size, String status, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;

        if (keyword != null && !keyword.isEmpty()) {
            orderPage = orderRepository.searchByOrderNo(keyword, pageable);
        } else if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            orderPage = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, pageable);
        } else {
            orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<OrderDTO> orders = orderPage.getContent().stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());

        return PageResult.<OrderDTO>builder()
                .content(orders)
                .page(page)
                .size(size)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .build();
    }

    /**
     * 修改订单状态
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
            order.setStatus(newStatus);
            
            // 如果是已完成状态，设置完成时间
            if (newStatus == Order.OrderStatus.COMPLETED) {
                order.setCompletedAt(java.time.LocalDateTime.now());
            }
            
            Order savedOrder = orderRepository.save(order);
            return convertToOrderDTO(savedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的订单状态: " + status);
        }
    }

    // ==================== 分类管理 ====================

    /**
     * 获取分类列表
     */
    public List<CategoryDTO> getCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::convertToCategoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * 新增分类
     */
    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setSortOrder(request.getSortOrder());
        Category saved = categoryRepository.save(category);
        return convertToCategoryDTO(saved);
    }

    /**
     * 更新分类
     */
    @Transactional
    public CategoryDTO updateCategory(Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setSortOrder(request.getSortOrder());
        Category saved = categoryRepository.save(category);
        return convertToCategoryDTO(saved);
    }

    /**
     * 删除分类
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        // 检查是否有餐厅使用该分类
        Long count = restaurantRepository.countByCategoryId(categoryId);
        if (count > 0) {
            throw new RuntimeException("该分类下还有 " + count + " 家餐厅，无法删除");
        }
        categoryRepository.deleteById(categoryId);
    }

    // ==================== 评价管理 ====================

    /**
     * 获取评价列表（分页）
     */
    public PageResult<ReviewDTO> getReviews(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage;

        if (keyword != null && !keyword.isEmpty()) {
            reviewPage = reviewRepository.searchByContent(keyword, pageable);
        } else {
            reviewPage = reviewRepository.findAllOrderByCreatedAtDesc(pageable);
        }

        List<ReviewDTO> reviews = reviewPage.getContent().stream()
                .map(this::convertToReviewDTO)
                .collect(Collectors.toList());

        return PageResult.<ReviewDTO>builder()
                .content(reviews)
                .page(page)
                .size(size)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .first(reviewPage.isFirst())
                .last(reviewPage.isLast())
                .build();
    }

    /**
     * 删除违规评价
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    /**
     * 管理员回复评价
     */
    @Transactional
    public ReviewDTO replyReview(Long reviewId, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));
        
        review.setReplyContent(content);
        review.setReplyTime(java.time.LocalDateTime.now());
        
        Review savedReview = reviewRepository.save(review);
        return convertToReviewDTO(savedReview);
    }

    // ==================== 通知管理 ====================

    /**
     * 发送系统广播通知（给所有用户）
     */
    @Transactional
    public void broadcastNotification(BroadcastRequest request) {
        List<User> allUsers = userRepository.findByRoleNot("ADMIN");
        
        for (User user : allUsers) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(request.getTitle());
            notification.setContent(request.getContent());
            notification.setType(Notification.NotificationType.valueOf(request.getType()));
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    // ==================== 转换方法 ====================

    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        dto.setAddress(user.getAddress());
        dto.setEnabled(user.getEnabled());
        dto.setRole(user.getRole());
        dto.setBalance(user.getBalance());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private RestaurantDTO convertToRestaurantDTO(Restaurant restaurant) {
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
        dto.setPhone(restaurant.getPhone());
        dto.setIsOpen(restaurant.getIsOpen());
        dto.setIsNew(restaurant.getIsNew());
        dto.setIsFeatured(restaurant.getIsFeatured());
        dto.setBalance(restaurant.getBalance());
        if (restaurant.getCategory() != null) {
            dto.setCategoryId(restaurant.getCategory().getId());
            dto.setCategoryName(restaurant.getCategory().getName());
        }
        dto.setTagsFromString(restaurant.getTags());
        // 平台抽成比例（优先使用餐厅设置，否则使用系统默认配置）
        BigDecimal rate = restaurant.getPlatformRate() != null ? restaurant.getPlatformRate() : getDefaultPlatformRate();
        dto.setPlatformRate(rate);
        dto.setPlatformRatePercent(rate.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        dto.setCreatedAtFromLocalDateTime(restaurant.getCreatedAt());
        return dto;
    }

    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setUserId(order.getUser().getId());
        dto.setUsername(order.getUser().getUsername());
        dto.setRestaurantId(order.getRestaurant().getId());
        dto.setRestaurantName(order.getRestaurant().getName());
        dto.setRestaurantLogo(order.getRestaurant().getLogo());
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
        dto.setCreatedAtFromLocalDateTime(order.getCreatedAt());
        dto.setCompletedAtFromLocalDateTime(order.getCompletedAt());

        // 转换订单项
        if (order.getItems() != null) {
            List<OrderItemDTO> items = order.getItems().stream()
                    .map(item -> {
                        OrderItemDTO itemDTO = new OrderItemDTO();
                        itemDTO.setId(item.getId());
                        itemDTO.setMenuItemId(item.getMenuItem().getId());
                        itemDTO.setMenuItemName(item.getMenuItemName());
                        itemDTO.setMenuItemImage(item.getMenuItemImage());
                        itemDTO.setPrice(item.getPrice());
                        itemDTO.setQuantity(item.getQuantity());
                        return itemDTO;
                    })
                    .collect(Collectors.toList());
            dto.setItems(items);
        }

        return dto;
    }

    private CategoryDTO convertToCategoryDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIcon(category.getIcon());
        dto.setColor(category.getColor());
        dto.setSortOrder(category.getSortOrder());
        // 统计该分类下的餐厅数量
        dto.setRestaurantCount(restaurantRepository.countByCategoryId(category.getId()));
        return dto;
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setOrderId(review.getOrder().getId());
        dto.setUserId(review.getUser().getId());
        dto.setUsername(review.getIsAnonymous() ? "匿名用户" : review.getUser().getUsername());
        dto.setUserAvatar(review.getIsAnonymous() ? null : review.getUser().getAvatar());
        dto.setRestaurantId(review.getRestaurant().getId());
        dto.setRestaurantName(review.getRestaurant().getName());
        dto.setTasteRating(review.getTasteRating());
        dto.setPackagingRating(review.getPackagingRating());
        dto.setDeliveryRating(review.getDeliveryRating());
        dto.setOverallRating(review.getOverallRating());
        dto.setContent(review.getContent());
        dto.setImagesFromString(review.getImages());
        dto.setIsAnonymous(review.getIsAnonymous());
        dto.setLikeCount(review.getLikeCount());
        dto.setReplyContent(review.getReplyContent());
        dto.setReplyTime(review.getReplyTime());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}

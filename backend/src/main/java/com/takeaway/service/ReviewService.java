package com.takeaway.service;

import com.takeaway.dto.OrderItemDTO;
import com.takeaway.dto.ReviewDTO;
import com.takeaway.dto.request.CreateReviewRequest;
import com.takeaway.dto.request.ReplyReviewRequest;
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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    /**
     * 创建评价
     */
    @Transactional
    public ReviewDTO createReview(Long userId, CreateReviewRequest request) {
        // 验证订单存在
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权评价此订单");
        }

        // 验证订单状态为已完成
        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("只有已完成的订单才能评价");
        }

        // 验证订单未被评价
        if (reviewRepository.existsByOrderId(request.getOrderId())) {
            throw new RuntimeException("该订单已评价");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 计算综合评分
        BigDecimal overallRating = BigDecimal.valueOf(
                (request.getTasteRating() + request.getPackagingRating() + request.getDeliveryRating()) / 3.0
        ).setScale(1, RoundingMode.HALF_UP);

        // 创建评价
        Review review = new Review();
        review.setOrder(order);
        review.setUser(user);
        review.setRestaurant(order.getRestaurant());
        review.setTasteRating(request.getTasteRating());
        review.setPackagingRating(request.getPackagingRating());
        review.setDeliveryRating(request.getDeliveryRating());
        review.setOverallRating(overallRating);
        review.setContent(request.getContent());
        review.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
        review.setLikeCount(0);

        // 处理图片
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            review.setImages(String.join(",", request.getImages()));
        }

        Review savedReview = reviewRepository.save(review);

        // 更新餐厅评分
        updateRestaurantRating(order.getRestaurant().getId());

        return toDTO(savedReview, userId);
    }

    /**
     * 获取餐厅评价列表
     */
    public Page<ReviewDTO> getReviewsByRestaurant(Long restaurantId, Long currentUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId, pageable);

        // 获取当前用户点赞的评价ID
        Set<Long> likedReviewIds = new HashSet<>();
        if (currentUserId != null) {
            List<Long> reviewIds = reviews.getContent().stream()
                    .map(Review::getId)
                    .collect(Collectors.toList());
            if (!reviewIds.isEmpty()) {
                likedReviewIds = reviewLikeRepository.findByUserIdAndReviewIdIn(currentUserId, reviewIds)
                        .stream()
                        .map(like -> like.getReview().getId())
                        .collect(Collectors.toSet());
            }
        }

        Set<Long> finalLikedReviewIds = likedReviewIds;
        return reviews.map(review -> toDTO(review, currentUserId, finalLikedReviewIds.contains(review.getId())));
    }

    /**
     * 检查订单是否已评价
     */
    public boolean isOrderReviewed(Long orderId) {
        return reviewRepository.existsByOrderId(orderId);
    }

    /**
     * 获取订单的评价
     */
    public ReviewDTO getReviewByOrder(Long orderId, Long currentUserId) {
        Review review = reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));
        return toDTO(review, currentUserId);
    }

    /**
     * 获取用户的评价列表
     */
    public List<ReviewDTO> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reviews.stream()
                .map(review -> toDTO(review, userId))
                .collect(Collectors.toList());
    }

    /**
     * 点赞评价
     */
    @Transactional
    public void likeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查是否已点赞
        if (reviewLikeRepository.existsByReviewIdAndUserId(reviewId, userId)) {
            throw new RuntimeException("已点赞过该评价");
        }

        // 创建点赞记录
        ReviewLike like = new ReviewLike();
        like.setReview(review);
        like.setUser(user);
        reviewLikeRepository.save(like);

        // 更新评价点赞数
        review.setLikeCount(review.getLikeCount() + 1);
        reviewRepository.save(review);
    }

    /**
     * 取消点赞
     */
    @Transactional
    public void unlikeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));

        ReviewLike like = reviewLikeRepository.findByReviewIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new RuntimeException("未点赞过该评价"));

        reviewLikeRepository.delete(like);

        // 更新评价点赞数
        review.setLikeCount(Math.max(0, review.getLikeCount() - 1));
        reviewRepository.save(review);
    }

    /**
     * 商家回复评价
     */
    @Transactional
    public ReviewDTO replyReview(Long reviewId, Long merchantUserId, ReplyReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));

        // 验证商家权限
        Restaurant restaurant = review.getRestaurant();
        if (restaurant.getOwner() == null || !restaurant.getOwner().getId().equals(merchantUserId)) {
            throw new RuntimeException("无权回复此评价");
        }

        // 检查是否已回复
        if (review.getReplyContent() != null && !review.getReplyContent().isEmpty()) {
            throw new RuntimeException("该评价已回复");
        }

        review.setReplyContent(request.getContent());
        review.setReplyTime(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        return toDTO(savedReview, null);
    }

    /**
     * 更新餐厅评分
     */
    @Transactional
    public void updateRestaurantRating(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));

        // 计算平均评分
        BigDecimal avgRating = reviewRepository.calculateAverageRatingByRestaurantId(restaurantId);
        if (avgRating != null) {
            restaurant.setRating(avgRating.setScale(1, RoundingMode.HALF_UP));
        }

        // 更新评价数量
        long reviewCount = reviewRepository.countByRestaurantId(restaurantId);
        restaurant.setReviewCount((int) reviewCount);

        restaurantRepository.save(restaurant);
    }

    /**
     * 获取菜品评价列表
     */
    public Page<ReviewDTO> getReviewsByMenuItem(Long menuItemId, Long currentUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByMenuItemId(menuItemId, pageable);

        // 获取当前用户点赞的评价ID
        Set<Long> likedReviewIds = new HashSet<>();
        if (currentUserId != null) {
            List<Long> reviewIds = reviews.getContent().stream()
                    .map(Review::getId)
                    .collect(Collectors.toList());
            if (!reviewIds.isEmpty()) {
                likedReviewIds = reviewLikeRepository.findByUserIdAndReviewIdIn(currentUserId, reviewIds)
                        .stream()
                        .map(like -> like.getReview().getId())
                        .collect(Collectors.toSet());
            }
        }

        Set<Long> finalLikedReviewIds = likedReviewIds;
        return reviews.map(review -> toDTO(review, currentUserId, finalLikedReviewIds.contains(review.getId())));
    }

    /**
     * 获取菜品评价统计
     */
    public Map<String, Object> getMenuItemRatingStats(Long menuItemId) {
        Map<String, Object> stats = new HashMap<>();

        // 获取评价总数
        long totalReviews = reviewRepository.countByMenuItemId(menuItemId);
        stats.put("totalReviews", totalReviews);

        // 获取平均评分
        BigDecimal avgRating = reviewRepository.calculateAverageRatingByMenuItemId(menuItemId);
        stats.put("averageRating", avgRating != null ? avgRating.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        return stats;
    }

    /**
     * 获取餐厅评分统计
     */
    public Map<String, Object> getRestaurantRatingStats(Long restaurantId) {
        Map<String, Object> stats = new HashMap<>();

        // 获取评价总数
        long totalReviews = reviewRepository.countByRestaurantId(restaurantId);
        stats.put("totalReviews", totalReviews);

        // 获取平均评分
        BigDecimal avgRating = reviewRepository.calculateAverageRatingByRestaurantId(restaurantId);
        stats.put("averageRating", avgRating != null ? avgRating.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        // 获取各维度平均评分
        List<Object[]> avgRatings = reviewRepository.getAverageRatingsByRestaurantId(restaurantId);
        if (!avgRatings.isEmpty() && avgRatings.get(0) != null) {
            Object[] ratings = avgRatings.get(0);
            stats.put("avgTasteRating", ratings[0] != null ? new BigDecimal(ratings[0].toString()).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            stats.put("avgPackagingRating", ratings[1] != null ? new BigDecimal(ratings[1].toString()).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            stats.put("avgDeliveryRating", ratings[2] != null ? new BigDecimal(ratings[2].toString()).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        } else {
            stats.put("avgTasteRating", BigDecimal.ZERO);
            stats.put("avgPackagingRating", BigDecimal.ZERO);
            stats.put("avgDeliveryRating", BigDecimal.ZERO);
        }

        // 获取评分分布
        List<Object[]> distribution = reviewRepository.getRatingDistributionByRestaurantId(restaurantId);
        Map<String, Long> ratingDistribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            ratingDistribution.put(String.valueOf(i), 0L);
        }
        for (Object[] item : distribution) {
            BigDecimal rating = (BigDecimal) item[0];
            Long count = (Long) item[1];
            // 四舍五入到整数
            int roundedRating = rating.setScale(0, RoundingMode.HALF_UP).intValue();
            String key = String.valueOf(roundedRating);
            ratingDistribution.put(key, ratingDistribution.getOrDefault(key, 0L) + count);
        }
        stats.put("ratingDistribution", ratingDistribution);

        return stats;
    }

    private ReviewDTO toDTO(Review review, Long currentUserId) {
        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = reviewLikeRepository.existsByReviewIdAndUserId(review.getId(), currentUserId);
        }
        return toDTO(review, currentUserId, isLiked);
    }

    private ReviewDTO toDTO(Review review, Long currentUserId, boolean isLiked) {
        User user = review.getUser();

        List<String> images = new ArrayList<>();
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            images = Arrays.asList(review.getImages().split(","));
        }

        // 获取订单商品信息
        List<OrderItemDTO> orderItems = review.getOrder().getItems().stream()
                .map(item -> {
                    OrderItemDTO dto = new OrderItemDTO();
                    dto.setId(item.getId());
                    dto.setMenuItemId(item.getMenuItem().getId());
                    dto.setMenuItemName(item.getMenuItemName());
                    dto.setMenuItemImage(item.getMenuItemImage());
                    dto.setPrice(item.getPrice());
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList());

        return ReviewDTO.builder()
                .id(review.getId())
                .orderId(review.getOrder().getId())
                .userId(review.getUser().getId())
                .username(review.getIsAnonymous() ? "匿名用户" : user.getUsername())
                .userAvatar(review.getIsAnonymous() ? null : user.getAvatar())
                .restaurantId(review.getRestaurant().getId())
                .tasteRating(review.getTasteRating())
                .packagingRating(review.getPackagingRating())
                .deliveryRating(review.getDeliveryRating())
                .overallRating(review.getOverallRating())
                .content(review.getContent())
                .images(images)
                .isAnonymous(review.getIsAnonymous())
                .likeCount(review.getLikeCount())
                .isLiked(isLiked)
                .replyContent(review.getReplyContent())
                .replyTime(review.getReplyTime())
                .createdAt(review.getCreatedAt())
                .orderItems(orderItems)
                .build();
    }
}

package com.takeaway.repository;

import com.takeaway.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Order.OrderStatus status, Pageable pageable);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderNo(String orderNo);

    List<Order> findByStatus(Order.OrderStatus status);

    boolean existsByOrderNo(String orderNo);

    // 商家相关查询
    Page<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId, Pageable pageable);

    Page<Order> findByRestaurantIdAndStatusOrderByCreatedAtDesc(Long restaurantId, Order.OrderStatus status, Pageable pageable);
    
    // 排除特定状态的订单（商家端全部订单排除待支付）
    Page<Order> findByRestaurantIdAndStatusNotOrderByCreatedAtDesc(Long restaurantId, Order.OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId")
    Long countByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = :status")
    Long countByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(o.payAmount) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'COMPLETED'")
    java.math.BigDecimal sumPayAmountByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId AND DATE(o.createdAt) = CURRENT_DATE")
    Long countTodayOrdersByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT SUM(o.payAmount) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'COMPLETED' AND DATE(o.createdAt) = CURRENT_DATE")
    java.math.BigDecimal sumTodayPayAmountByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 管理后台查询方法
    
    // 统计今日完成的订单数
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND DATE(o.completedAt) = CURRENT_DATE")
    long countTodayCompleted();
    
    // 统计待处理订单（已支付但未完成）
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('PAID', 'CONFIRMED', 'PREPARING', 'DELIVERING')")
    long countPending();
    
    // 统计总营收
    @Query("SELECT COALESCE(SUM(o.payAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    java.math.BigDecimal sumTotalRevenue();
    
    // 统计今日营收
    @Query("SELECT COALESCE(SUM(o.payAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND DATE(o.completedAt) = CURRENT_DATE")
    java.math.BigDecimal sumTodayRevenue();
    
    // 按状态分页查询订单
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);
    
    // 搜索订单（订单号）
    @Query("SELECT o FROM Order o WHERE o.orderNo LIKE %:keyword%")
    Page<Order> searchByOrderNo(@Param("keyword") String keyword, Pageable pageable);
    
    // 所有订单分页（按创建时间倒序）
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 统计平台总抽成收入
    @Query("SELECT COALESCE(SUM(o.platformFee), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    java.math.BigDecimal sumTotalPlatformFee();
    
    // 统计今日平台抽成收入
    @Query("SELECT COALESCE(SUM(o.platformFee), 0) FROM Order o WHERE o.status = 'COMPLETED' AND DATE(o.completedAt) = CURRENT_DATE")
    java.math.BigDecimal sumTodayPlatformFee();
    
    // 统计商家总实际收入
    @Query("SELECT COALESCE(SUM(o.merchantIncome), 0) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'COMPLETED'")
    java.math.BigDecimal sumMerchantIncomeByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 统计商家今日实际收入
    @Query("SELECT COALESCE(SUM(o.merchantIncome), 0) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'COMPLETED' AND DATE(o.completedAt) = CURRENT_DATE")
    java.math.BigDecimal sumTodayMerchantIncomeByRestaurantId(@Param("restaurantId") Long restaurantId);
}

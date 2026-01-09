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
}

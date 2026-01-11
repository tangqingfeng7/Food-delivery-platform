package com.takeaway.repository;

import com.takeaway.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // 根据订单ID查找评价
    Optional<Review> findByOrderId(Long orderId);
    
    // 检查订单是否已评价
    boolean existsByOrderId(Long orderId);
    
    // 根据餐厅ID分页查询评价
    Page<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId, Pageable pageable);
    
    // 根据用户ID查询评价
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 统计餐厅评价数量
    long countByRestaurantId(Long restaurantId);
    
    // 计算餐厅平均评分
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    BigDecimal calculateAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 根据餐厅ID获取评分分布（用于统计）
    @Query("SELECT r.overallRating, COUNT(r) FROM Review r WHERE r.restaurant.id = :restaurantId GROUP BY r.overallRating ORDER BY r.overallRating DESC")
    List<Object[]> getRatingDistributionByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 获取餐厅的各维度平均评分
    @Query("SELECT AVG(r.tasteRating), AVG(r.packagingRating), AVG(r.deliveryRating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    List<Object[]> getAverageRatingsByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 根据菜品ID查询包含该菜品的评价（通过订单项关联）
    @Query("SELECT DISTINCT r FROM Review r JOIN r.order.items oi WHERE oi.menuItem.id = :menuItemId ORDER BY r.createdAt DESC")
    Page<Review> findByMenuItemId(@Param("menuItemId") Long menuItemId, Pageable pageable);
    
    // 统计包含该菜品的评价数量
    @Query("SELECT COUNT(DISTINCT r) FROM Review r JOIN r.order.items oi WHERE oi.menuItem.id = :menuItemId")
    long countByMenuItemId(@Param("menuItemId") Long menuItemId);
    
    // 计算包含该菜品的评价平均分
    @Query("SELECT AVG(r.overallRating) FROM Review r JOIN r.order.items oi WHERE oi.menuItem.id = :menuItemId")
    java.math.BigDecimal calculateAverageRatingByMenuItemId(@Param("menuItemId") Long menuItemId);
    
    // 管理后台查询方法
    
    // 统计今日新增评价
    @Query("SELECT COUNT(r) FROM Review r WHERE DATE(r.createdAt) = CURRENT_DATE")
    long countTodayCreated();
    
    // 所有评价分页（按创建时间倒序）
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    Page<Review> findAllOrderByCreatedAtDesc(Pageable pageable);
    
    // 搜索评价（按内容）
    @Query("SELECT r FROM Review r WHERE r.content LIKE %:keyword% ORDER BY r.createdAt DESC")
    Page<Review> searchByContent(@Param("keyword") String keyword, Pageable pageable);
}

package com.takeaway.repository;

import com.takeaway.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Page<Restaurant> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.name LIKE %:keyword% OR r.tags LIKE %:keyword%")
    Page<Restaurant> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.category.id = :categoryId AND (r.name LIKE %:keyword% OR r.tags LIKE %:keyword%)")
    Page<Restaurant> searchByCategoryAndKeyword(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    List<Restaurant> findByIsFeaturedTrueOrderByRatingDesc(Pageable pageable);

    @Query("SELECT r FROM Restaurant r ORDER BY r.rating DESC")
    List<Restaurant> findTopRated(Pageable pageable);

    List<Restaurant> findByIsOpenTrue();

    @Query("SELECT COUNT(r) FROM Restaurant r WHERE r.category.id = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

    // 商家相关查询
    Optional<Restaurant> findByOwnerId(Long ownerId);

    boolean existsByOwnerId(Long ownerId);
    
    // 管理后台查询方法
    
    // 统计营业中的餐厅数量
    long countByIsOpenTrue();
    
    // 统计今日新增餐厅
    @Query("SELECT COUNT(r) FROM Restaurant r WHERE DATE(r.createdAt) = CURRENT_DATE")
    long countTodayCreated();
    
    // 所有餐厅分页（按创建时间倒序）
    @Query("SELECT r FROM Restaurant r ORDER BY r.createdAt DESC")
    Page<Restaurant> findAllOrderByCreatedAtDesc(Pageable pageable);
}

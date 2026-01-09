package com.takeaway.repository;

import com.takeaway.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);

    List<MenuItem> findByRestaurantIdAndMenuCategoryIdOrderBySortOrderAsc(Long restaurantId, Long menuCategoryId);

    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.isAvailable = true ORDER BY m.sortOrder ASC")
    List<MenuItem> findAvailableByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.menuCategory.id = :categoryId AND m.isAvailable = true ORDER BY m.sortOrder ASC")
    List<MenuItem> findAvailableByRestaurantIdAndCategoryId(@Param("restaurantId") Long restaurantId, @Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.menuCategory.id = :categoryId")
    Long countByMenuCategoryId(@Param("categoryId") Long categoryId);

    List<MenuItem> findByRestaurantIdAndIsHotTrue(Long restaurantId);
}

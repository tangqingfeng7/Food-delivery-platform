package com.takeaway.repository;

import com.takeaway.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {

    List<MenuCategory> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);

    @Query("SELECT mc FROM MenuCategory mc WHERE mc.restaurant.id = :restaurantId ORDER BY mc.sortOrder ASC")
    List<MenuCategory> findAllByRestaurantId(@Param("restaurantId") Long restaurantId);
}

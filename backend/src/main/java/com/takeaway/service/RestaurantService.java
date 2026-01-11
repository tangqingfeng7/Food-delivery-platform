package com.takeaway.service;

import com.takeaway.dto.MenuCategoryDTO;
import com.takeaway.dto.MenuItemDTO;
import com.takeaway.dto.RestaurantDTO;
import com.takeaway.entity.MenuCategory;
import com.takeaway.entity.MenuItem;
import com.takeaway.entity.Restaurant;
import com.takeaway.repository.MenuCategoryRepository;
import com.takeaway.repository.MenuItemRepository;
import com.takeaway.repository.RestaurantRepository;
import com.takeaway.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReviewRepository reviewRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public Page<RestaurantDTO> getRestaurants(Long categoryId, String keyword, String sortBy, int page, int size) {
        return getRestaurants(categoryId, keyword, sortBy, page, size, null, null);
    }

    public Page<RestaurantDTO> getRestaurants(Long categoryId, String keyword, String sortBy, int page, int size, Double userLat, Double userLng) {
        Sort sort = getSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Restaurant> restaurants;
        if (categoryId != null && keyword != null && !keyword.isEmpty()) {
            restaurants = restaurantRepository.searchByCategoryAndKeyword(categoryId, keyword, pageable);
        } else if (categoryId != null) {
            restaurants = restaurantRepository.findByCategoryId(categoryId, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            restaurants = restaurantRepository.searchByKeyword(keyword, pageable);
        } else {
            restaurants = restaurantRepository.findAll(pageable);
        }

        return restaurants.map(restaurant -> toDTOWithLocation(restaurant, userLat, userLng));
    }

    public List<RestaurantDTO> getFeaturedRestaurants(int limit) {
        return getFeaturedRestaurants(limit, null, null);
    }

    public List<RestaurantDTO> getFeaturedRestaurants(int limit, Double userLat, Double userLng) {
        Pageable pageable = PageRequest.of(0, limit);
        return restaurantRepository.findByIsFeaturedTrueOrderByRatingDesc(pageable)
                .stream()
                .map(restaurant -> toDTOWithLocation(restaurant, userLat, userLng))
                .collect(Collectors.toList());
    }

    public RestaurantDTO getRestaurantById(Long id) {
        return getRestaurantById(id, null, null);
    }

    public RestaurantDTO getRestaurantById(Long id, Double userLat, Double userLng) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));
        RestaurantDTO dto = toDTO(restaurant);
        
        // 如果提供了用户位置，计算距离和配送时间
        if (userLat != null && userLng != null && 
            restaurant.getLatitude() != null && restaurant.getLongitude() != null) {
            double distance = calculateDistance(
                userLat, userLng,
                restaurant.getLatitude().doubleValue(), restaurant.getLongitude().doubleValue()
            );
            // 保留一位小数
            dto.setDistance(BigDecimal.valueOf(distance).setScale(1, RoundingMode.HALF_UP));
            // 根据距离计算配送时间
            dto.setDeliveryTime(calculateDeliveryTime(distance));
        }
        
        return dto;
    }

    /**
     * 根据距离计算预计送达时间
     * 公式：当前时间 + 基础准备时间 + 距离 * 每公里配送时间
     * @param distance 距离（公里）
     * @return 预计送达时间字符串，如 "15:30"
     */
    private String calculateDeliveryTime(double distance) {
        final int BASE_PREP_TIME = 15; // 基础准备时间（分钟）
        final int TIME_PER_KM = 3;     // 每公里配送时间（分钟）
        
        int totalMinutes = BASE_PREP_TIME + (int) Math.ceil(distance * TIME_PER_KM);
        
        // 计算预计送达时间
        java.time.LocalTime now = java.time.LocalTime.now();
        java.time.LocalTime arrivalTime = now.plusMinutes(totalMinutes);
        
        return arrivalTime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * 计算两点之间的距离（公里）
     * 使用 Haversine 公式
     */
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371; // 地球半径（公里）
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<MenuCategoryDTO> getMenuCategories(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId)
                .stream()
                .map(this::toMenuCategoryDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getMenuItems(Long restaurantId, Long categoryId) {
        List<MenuItem> items;
        if (categoryId != null) {
            items = menuItemRepository.findAvailableByRestaurantIdAndCategoryId(restaurantId, categoryId);
        } else {
            items = menuItemRepository.findAvailableByRestaurantId(restaurantId);
        }
        return items.stream()
                .map(this::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取单个菜品详情
     */
    public MenuItemDTO getMenuItemById(Long menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));
        return toMenuItemDTO(menuItem);
    }

    private Sort getSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "rating");
        }
        return switch (sortBy) {
            case "distance" -> Sort.by(Sort.Direction.ASC, "distance");
            case "deliveryTime" -> Sort.by(Sort.Direction.ASC, "deliveryTime");
            case "minOrder" -> Sort.by(Sort.Direction.ASC, "minOrder");
            default -> Sort.by(Sort.Direction.DESC, "rating");
        };
    }

    private RestaurantDTO toDTO(Restaurant restaurant) {
        return toDTOWithLocation(restaurant, null, null);
    }

    /**
     * 将餐厅实体转换为DTO，并根据用户位置计算距离和配送时间
     */
    private RestaurantDTO toDTOWithLocation(Restaurant restaurant, Double userLat, Double userLng) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setImage(restaurant.getImage());
        dto.setLogo(restaurant.getLogo());
        
        // 从评价表实时统计评价数量和评分
        long reviewCount = reviewRepository.countByRestaurantId(restaurant.getId());
        dto.setReviewCount((int) reviewCount);
        
        // 如果有评价，使用实际平均评分；否则使用默认评分 5.0
        if (reviewCount > 0) {
            BigDecimal avgRating = reviewRepository.calculateAverageRatingByRestaurantId(restaurant.getId());
            dto.setRating(avgRating != null ? avgRating.setScale(1, RoundingMode.HALF_UP) : BigDecimal.valueOf(5.0));
        } else {
            dto.setRating(BigDecimal.valueOf(5.0));
        }
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
        
        dto.setCreatedAt(restaurant.getCreatedAt() != null ? restaurant.getCreatedAt().format(DATETIME_FORMATTER) : null);

        // 如果提供了用户位置，计算真实距离和配送时间
        if (userLat != null && userLng != null && 
            restaurant.getLatitude() != null && restaurant.getLongitude() != null) {
            double distance = calculateDistance(
                userLat, userLng,
                restaurant.getLatitude().doubleValue(), restaurant.getLongitude().doubleValue()
            );
            dto.setDistance(BigDecimal.valueOf(distance).setScale(1, RoundingMode.HALF_UP));
            dto.setDeliveryTime(calculateDeliveryTime(distance));
        }

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
}

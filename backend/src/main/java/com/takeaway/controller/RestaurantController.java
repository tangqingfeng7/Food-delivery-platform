package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.MenuCategoryDTO;
import com.takeaway.dto.MenuItemDTO;
import com.takeaway.dto.RestaurantDTO;
import com.takeaway.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ApiResponse<Page<RestaurantDTO>> getRestaurants(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "rating") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        
        Page<RestaurantDTO> restaurants = restaurantService.getRestaurants(categoryId, keyword, sortBy, page, size);
        return ApiResponse.success(restaurants);
    }

    @GetMapping("/featured")
    public ApiResponse<List<RestaurantDTO>> getFeaturedRestaurants(
            @RequestParam(required = false, defaultValue = "6") int limit) {
        
        List<RestaurantDTO> restaurants = restaurantService.getFeaturedRestaurants(limit);
        return ApiResponse.success(restaurants);
    }

    @GetMapping("/{id}")
    public ApiResponse<RestaurantDTO> getRestaurantById(@PathVariable Long id) {
        try {
            RestaurantDTO restaurant = restaurantService.getRestaurantById(id);
            return ApiResponse.success(restaurant);
        } catch (Exception e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @GetMapping("/{id}/menu-categories")
    public ApiResponse<List<MenuCategoryDTO>> getMenuCategories(@PathVariable Long id) {
        List<MenuCategoryDTO> categories = restaurantService.getMenuCategories(id);
        return ApiResponse.success(categories);
    }

    @GetMapping("/{id}/menu-items")
    public ApiResponse<List<MenuItemDTO>> getMenuItems(
            @PathVariable Long id,
            @RequestParam(required = false) Long categoryId) {
        
        List<MenuItemDTO> items = restaurantService.getMenuItems(id, categoryId);
        return ApiResponse.success(items);
    }

    @GetMapping("/search")
    public ApiResponse<Page<RestaurantDTO>> searchRestaurants(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        
        Page<RestaurantDTO> restaurants = restaurantService.getRestaurants(null, keyword, "rating", page, size);
        return ApiResponse.success(restaurants);
    }
}

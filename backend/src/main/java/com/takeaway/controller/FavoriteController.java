package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.FavoriteDTO;
import com.takeaway.entity.User;
import com.takeaway.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ApiResponse<List<FavoriteDTO>> getFavorites(@AuthenticationPrincipal User user) {
        List<FavoriteDTO> favorites = favoriteService.getFavorites(user.getId());
        return ApiResponse.success(favorites);
    }

    @PostMapping
    public ApiResponse<FavoriteDTO> addFavorite(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Long> request) {
        Long restaurantId = request.get("restaurantId");
        try {
            FavoriteDTO favorite = favoriteService.addFavorite(user.getId(), restaurantId);
            return ApiResponse.success(favorite);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{restaurantId}")
    public ApiResponse<Void> removeFavorite(
            @AuthenticationPrincipal User user,
            @PathVariable Long restaurantId) {
        favoriteService.removeFavorite(user.getId(), restaurantId);
        return ApiResponse.success(null);
    }

    @GetMapping("/check/{restaurantId}")
    public ApiResponse<Boolean> checkFavorite(
            @AuthenticationPrincipal User user,
            @PathVariable Long restaurantId) {
        boolean isFavorite = favoriteService.checkFavorite(user.getId(), restaurantId);
        return ApiResponse.success(isFavorite);
    }
}

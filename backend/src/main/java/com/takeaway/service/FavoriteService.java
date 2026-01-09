package com.takeaway.service;

import com.takeaway.dto.FavoriteDTO;
import com.takeaway.entity.Favorite;
import com.takeaway.entity.Restaurant;
import com.takeaway.entity.User;
import com.takeaway.repository.FavoriteRepository;
import com.takeaway.repository.RestaurantRepository;
import com.takeaway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<FavoriteDTO> getFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FavoriteDTO addFavorite(Long userId, Long restaurantId) {
        if (favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            throw new RuntimeException("已经收藏过该餐厅");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("餐厅不存在"));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRestaurant(restaurant);

        Favorite saved = favoriteRepository.save(favorite);
        return toDTO(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, Long restaurantId) {
        favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
    }

    public boolean checkFavorite(Long userId, Long restaurantId) {
        return favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
    }

    private FavoriteDTO toDTO(Favorite favorite) {
        Restaurant restaurant = favorite.getRestaurant();
        FavoriteDTO dto = new FavoriteDTO();
        dto.setId(favorite.getId());
        dto.setRestaurantId(restaurant.getId());
        dto.setRestaurantName(restaurant.getName());
        dto.setRestaurantImage(restaurant.getImage());
        dto.setRestaurantLogo(restaurant.getLogo());
        dto.setRating(restaurant.getRating());
        dto.setReviewCount(restaurant.getReviewCount());
        dto.setDeliveryTime(restaurant.getDeliveryTime());
        dto.setDeliveryFee(restaurant.getDeliveryFee());
        dto.setMinOrder(restaurant.getMinOrder());
        dto.setTags(restaurant.getTags());
        dto.setCreatedAt(favorite.getCreatedAt() != null ? favorite.getCreatedAt().format(DATETIME_FORMATTER) : null);
        return dto;
    }
}

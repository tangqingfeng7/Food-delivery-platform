package com.takeaway.repository;

import com.takeaway.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    
    // 检查用户是否已点赞某评价
    boolean existsByReviewIdAndUserId(Long reviewId, Long userId);
    
    // 根据评价ID和用户ID查找点赞记录
    Optional<ReviewLike> findByReviewIdAndUserId(Long reviewId, Long userId);
    
    // 统计评价的点赞数
    long countByReviewId(Long reviewId);
    
    // 获取用户点赞过的评价ID列表
    List<ReviewLike> findByUserIdAndReviewIdIn(Long userId, List<Long> reviewIds);
}

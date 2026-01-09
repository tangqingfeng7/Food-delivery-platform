package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.NotificationDTO;
import com.takeaway.entity.User;
import com.takeaway.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 消息通知控制器
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 获取所有通知
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(@AuthenticationPrincipal User user) {
        List<NotificationDTO> notifications = notificationService.getNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * 获取未读通知
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        Long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * 标记单条通知为已读
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 标记所有通知为已读
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 删除单条通知
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 删除所有通知
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(@AuthenticationPrincipal User user) {
        notificationService.deleteAllNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

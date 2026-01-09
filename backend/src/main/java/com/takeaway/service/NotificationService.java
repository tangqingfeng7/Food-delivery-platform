package com.takeaway.service;

import com.takeaway.dto.NotificationDTO;
import com.takeaway.entity.Notification;
import com.takeaway.entity.User;
import com.takeaway.repository.NotificationRepository;
import com.takeaway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 消息通知服务层
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 获取用户所有通知
     */
    public List<NotificationDTO> getNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户未读通知
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户未读通知数量
     */
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    /**
     * 标记通知为已读
     */
    @Transactional
    public void markAsRead(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        notificationRepository.markAsRead(id, user);
    }

    /**
     * 标记所有通知为已读
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        notificationRepository.markAllAsRead(user);
    }

    /**
     * 删除通知
     */
    @Transactional
    public void deleteNotification(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        notificationRepository.deleteByIdAndUser(id, user);
    }

    /**
     * 删除所有通知
     */
    @Transactional
    public void deleteAllNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        notificationRepository.deleteByUser(user);
    }

    /**
     * 创建通知（系统内部调用）
     */
    @Transactional
    public NotificationDTO createNotification(Long userId, String title, String content, 
                                               Notification.NotificationType type, Long relatedId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);
        
        notification = notificationRepository.save(notification);
        return convertToDTO(notification);
    }

    /**
     * 转换为DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setType(notification.getType().name());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedId(notification.getRelatedId());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}

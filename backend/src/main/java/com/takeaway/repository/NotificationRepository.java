package com.takeaway.repository;

import com.takeaway.entity.Notification;
import com.takeaway.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 消息通知数据访问层
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 根据用户查询所有通知（按创建时间倒序）
     */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    /**
     * 根据用户和已读状态查询通知
     */
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);

    /**
     * 统计用户未读通知数量
     */
    Long countByUserAndIsRead(User user, Boolean isRead);

    /**
     * 将用户所有通知标记为已读
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user")
    int markAllAsRead(@Param("user") User user);

    /**
     * 将指定通知标记为已读
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.user = :user")
    int markAsRead(@Param("id") Long id, @Param("user") User user);

    /**
     * 删除用户的指定通知
     */
    void deleteByIdAndUser(Long id, User user);

    /**
     * 删除用户所有通知
     */
    void deleteByUser(User user);
}

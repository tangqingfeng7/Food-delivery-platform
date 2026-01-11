package com.takeaway.repository;

import com.takeaway.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByPhone(String phone);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
    
    // 管理后台查询方法
    
    // 根据角色统计用户数量
    long countByRole(String role);
    
    // 统计启用的用户数量
    long countByEnabledTrue();
    
    // 统计今日注册用户
    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.createdAt) = CURRENT_DATE")
    long countTodayRegistered();
    
    // 根据角色分页查询用户
    Page<User> findByRole(String role, Pageable pageable);
    
    // 搜索用户（用户名或手机号）
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.phone LIKE %:keyword%")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // 根据角色搜索用户
    @Query("SELECT u FROM User u WHERE u.role = :role AND (u.username LIKE %:keyword% OR u.phone LIKE %:keyword%)")
    Page<User> searchByRoleAndKeyword(@Param("role") String role, @Param("keyword") String keyword, Pageable pageable);
    
    // 获取所有用户（管理后台）
    List<User> findByRoleNot(String role);
}

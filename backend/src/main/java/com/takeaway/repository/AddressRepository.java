package com.takeaway.repository;

import com.takeaway.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 地址 Repository
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * 根据用户 ID 获取地址列表，按创建时间降序
     */
    List<Address> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 根据用户 ID 获取地址列表，默认地址排在前面
     */
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId ORDER BY a.isDefault DESC, a.createdAt DESC")
    List<Address> findByUserIdOrderByDefaultAndCreatedAt(@Param("userId") Long userId);

    /**
     * 根据 ID 和用户 ID 查找地址
     */
    Optional<Address> findByIdAndUserId(Long id, Long userId);

    /**
     * 获取用户的默认地址
     */
    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);

    /**
     * 将用户的所有地址设为非默认
     */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultByUserId(@Param("userId") Long userId);

    /**
     * 删除用户的指定地址
     */
    void deleteByIdAndUserId(Long id, Long userId);

    /**
     * 统计用户地址数量
     */
    long countByUserId(Long userId);
}

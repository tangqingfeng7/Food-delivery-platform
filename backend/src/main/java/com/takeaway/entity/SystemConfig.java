package com.takeaway.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 系统配置实体
 * 存储平台全局配置，如默认抽成比例等
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true, length = 50)
    private String configKey;  // 配置键

    @Column(name = "config_value", nullable = false, length = 255)
    private String configValue;  // 配置值

    @Column(name = "config_desc", length = 255)
    private String configDesc;  // 配置描述

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 配置键常量
    public static final String KEY_DEFAULT_PLATFORM_RATE = "default_platform_rate";  // 默认平台抽成比例

    /**
     * 获取配置值为 BigDecimal
     */
    public BigDecimal getValueAsBigDecimal() {
        try {
            return new BigDecimal(this.configValue);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}

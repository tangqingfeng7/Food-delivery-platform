package com.takeaway.service;

import com.takeaway.dto.AddressDTO;
import com.takeaway.dto.request.AddressRequest;
import com.takeaway.entity.Address;
import com.takeaway.entity.User;
import com.takeaway.repository.AddressRepository;
import com.takeaway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 地址服务类
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 获取用户的地址列表
     */
    public List<AddressDTO> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAndCreatedAt(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户的默认地址
     */
    public AddressDTO getDefaultAddress(Long userId) {
        return addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .map(this::toDTO)
                .orElse(null);
    }

    /**
     * 添加地址
     */
    @Transactional
    public AddressDTO addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 如果是第一个地址或设置为默认，则清除其他默认地址
        boolean isFirstAddress = addressRepository.countByUserId(userId) == 0;
        boolean shouldBeDefault = isFirstAddress || Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault) {
            addressRepository.clearDefaultByUserId(userId);
        }

        Address address = new Address();
        address.setUser(user);
        address.setName(request.getName());
        address.setPhone(request.getPhone());
        address.setAddress(request.getAddress());
        address.setLatitude(request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : null);
        address.setLongitude(request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : null);
        address.setIsDefault(shouldBeDefault);

        Address saved = addressRepository.save(address);
        return toDTO(saved);
    }

    /**
     * 更新地址
     */
    @Transactional
    public AddressDTO updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("地址不存在"));

        if (request.getName() != null) {
            address.setName(request.getName());
        }
        if (request.getPhone() != null) {
            address.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            address.setAddress(request.getAddress());
        }
        if (request.getLatitude() != null) {
            address.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        }
        if (request.getLongitude() != null) {
            address.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        }
        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.clearDefaultByUserId(userId);
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        return toDTO(saved);
    }

    /**
     * 删除地址
     */
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("地址不存在"));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // 如果删除的是默认地址，将第一个地址设为默认
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setIsDefault(true);
                addressRepository.save(first);
            }
        }
    }

    /**
     * 设置默认地址
     */
    @Transactional
    public AddressDTO setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("地址不存在"));

        // 清除其他默认地址
        addressRepository.clearDefaultByUserId(userId);

        // 设置为默认
        address.setIsDefault(true);
        Address saved = addressRepository.save(address);
        return toDTO(saved);
    }

    /**
     * 转换为 DTO
     */
    private AddressDTO toDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setUserId(address.getUser().getId());
        dto.setName(address.getName());
        dto.setPhone(address.getPhone());
        dto.setAddress(address.getAddress());
        dto.setLatitude(address.getLatitude() != null ? address.getLatitude().doubleValue() : null);
        dto.setLongitude(address.getLongitude() != null ? address.getLongitude().doubleValue() : null);
        dto.setIsDefault(address.getIsDefault());
        dto.setCreatedAt(address.getCreatedAt() != null ? address.getCreatedAt().format(DATETIME_FORMATTER) : null);
        return dto;
    }
}

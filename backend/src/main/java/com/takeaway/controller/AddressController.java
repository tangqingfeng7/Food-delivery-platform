package com.takeaway.controller;

import com.takeaway.dto.AddressDTO;
import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.request.AddressRequest;
import com.takeaway.entity.User;
import com.takeaway.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 地址管理控制器
 */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * 获取用户地址列表
     */
    @GetMapping
    public ApiResponse<List<AddressDTO>> getAddresses(@AuthenticationPrincipal User user) {
        List<AddressDTO> addresses = addressService.getAddresses(user.getId());
        return ApiResponse.success(addresses);
    }

    /**
     * 获取默认地址
     */
    @GetMapping("/default")
    public ApiResponse<AddressDTO> getDefaultAddress(@AuthenticationPrincipal User user) {
        AddressDTO address = addressService.getDefaultAddress(user.getId());
        return ApiResponse.success(address);
    }

    /**
     * 添加地址
     */
    @PostMapping
    public ApiResponse<AddressDTO> addAddress(
            @AuthenticationPrincipal User user,
            @RequestBody AddressRequest request) {
        try {
            AddressDTO address = addressService.addAddress(user.getId(), request);
            return ApiResponse.success(address);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新地址
     */
    @PutMapping("/{id}")
    public ApiResponse<AddressDTO> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody AddressRequest request) {
        try {
            AddressDTO address = addressService.updateAddress(user.getId(), id, request);
            return ApiResponse.success(address);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 删除地址
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            addressService.deleteAddress(user.getId(), id);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 设置默认地址
     */
    @PutMapping("/{id}/default")
    public ApiResponse<AddressDTO> setDefaultAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            AddressDTO address = addressService.setDefaultAddress(user.getId(), id);
            return ApiResponse.success(address);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}

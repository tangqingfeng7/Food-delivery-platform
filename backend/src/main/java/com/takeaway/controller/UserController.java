package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.UserDTO;
import com.takeaway.dto.request.ChangePasswordRequest;
import com.takeaway.dto.request.ChangePhoneRequest;
import com.takeaway.dto.request.DeleteAccountRequest;
import com.takeaway.entity.User;
import com.takeaway.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        UserDTO userDTO = userService.getCurrentUser(user.getId());
        return ApiResponse.success(userDTO);
    }

    @PutMapping("/me")
    public ApiResponse<UserDTO> updateUser(@AuthenticationPrincipal User user,
                                           @RequestBody UserDTO userDTO) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        UserDTO updated = userService.updateUser(user.getId(), userDTO);
        return ApiResponse.success(updated);
    }

    @PutMapping("/me/address")
    public ApiResponse<UserDTO> updateAddress(@AuthenticationPrincipal User user,
                                              @RequestBody Map<String, String> request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        String address = request.get("address");
        UserDTO updated = userService.updateAddress(user.getId(), address);
        return ApiResponse.success(updated);
    }

    /**
     * 修改密码
     */
    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal User user,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            userService.changePassword(user.getId(), request);
            return ApiResponse.success("密码修改成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 修改手机号
     */
    @PutMapping("/me/phone")
    public ApiResponse<UserDTO> changePhone(@AuthenticationPrincipal User user,
                                            @Valid @RequestBody ChangePhoneRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            UserDTO updated = userService.changePhone(user.getId(), request);
            return ApiResponse.success("手机号修改成功", updated);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 注销账号
     */
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteAccount(@AuthenticationPrincipal User user,
                                           @Valid @RequestBody DeleteAccountRequest request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        try {
            userService.deleteAccount(user.getId(), request);
            return ApiResponse.success("账号已注销", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 验证密码
     */
    @PostMapping("/me/verify-password")
    public ApiResponse<Boolean> verifyPassword(@AuthenticationPrincipal User user,
                                               @RequestBody Map<String, String> request) {
        if (user == null) {
            return ApiResponse.error(401, "请先登录");
        }
        String password = request.get("password");
        boolean isValid = userService.verifyPassword(user.getId(), password);
        return ApiResponse.success(isValid);
    }
}

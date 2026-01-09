package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.dto.UserDTO;
import com.takeaway.entity.User;
import com.takeaway.service.UserService;
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
}

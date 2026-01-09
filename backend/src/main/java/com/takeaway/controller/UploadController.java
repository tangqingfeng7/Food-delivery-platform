package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传控制器
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private FileService fileService;

    /**
     * 上传图片
     */
    @PostMapping("/image")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileService.uploadImage(file);
        
        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        
        return ApiResponse.success("上传成功", result);
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/image")
    public ApiResponse<Void> deleteImage(@RequestParam("url") String url) {
        fileService.deleteFile(url);
        return ApiResponse.success("删除成功", null);
    }
}

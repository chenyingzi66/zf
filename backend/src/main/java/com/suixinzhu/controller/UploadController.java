package com.suixinzhu.controller;

import com.suixinzhu.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class UploadController {

    @Value("${upload.path:C:/Users/16026/Desktop/suixin/uploads/}")
    private String uploadPath;

    @Value("${upload.url-prefix:http://localhost:8080/uploads/}")
    private String urlPrefix;

    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        if (file == null || file.isEmpty()) {
            return Result.error("请选择文件");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
            
            String fullPath = uploadPath + "avatar/" + datePath;
            File dir = new File(fullPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            File destFile = new File(fullPath + "/" + newFilename);
            file.transferTo(destFile);
            
            String fileUrl = urlPrefix + "avatar/" + datePath + "/" + newFilename;
            
            return Result.success(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    @PostMapping("/house")
    public Result<String> uploadHouseImage(@RequestParam("file") MultipartFile file,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        if (file == null || file.isEmpty()) {
            return Result.error("请选择文件");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
            
            String fullPath = uploadPath + "house/" + datePath;
            File dir = new File(fullPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            File destFile = new File(fullPath + "/" + newFilename);
            file.transferTo(destFile);
            
            String fileUrl = urlPrefix + "house/" + datePath + "/" + newFilename;
            
            return Result.success(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    @PostMapping("/banner")
    public Result<String> uploadBannerImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("请选择文件");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
            
            String fullPath = uploadPath + "banner/" + datePath;
            File dir = new File(fullPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            File destFile = new File(fullPath + "/" + newFilename);
            file.transferTo(destFile);
            
            String fileUrl = urlPrefix + "banner/" + datePath + "/" + newFilename;
            
            return Result.success(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
}

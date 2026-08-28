package com.suixinzhu.controller;

import com.suixinzhu.common.Result;
import com.suixinzhu.entity.Banner;
import com.suixinzhu.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/banner")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @GetMapping("/list")
    public Result<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerService.getActiveBanners();
        return Result.success(banners);
    }

    @GetMapping("/all")
    public Result<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        return Result.success(banners);
    }

    @PostMapping("/add")
    public Result<Boolean> addBanner(@RequestBody Map<String, Object> params) {
        String picUrl = (String) params.get("picUrl");
        Integer sort = params.get("sort") != null ? (Integer) params.get("sort") : 0;
        
        if (picUrl == null || picUrl.isEmpty()) {
            return Result.error("图片地址不能为空");
        }
        
        boolean success = bannerService.addBanner(picUrl, sort);
        return success ? Result.success(true) : Result.error("添加失败");
    }

    @PostMapping("/update")
    public Result<Boolean> updateBanner(@RequestBody Map<String, Object> params) {
        Long id = params.get("id") != null ? Long.valueOf(params.get("id").toString()) : null;
        String picUrl = (String) params.get("picUrl");
        Integer sort = params.get("sort") != null ? (Integer) params.get("sort") : null;
        Integer status = params.get("status") != null ? (Integer) params.get("status") : null;

        if (id == null) {
            return Result.error("ID不能为空");
        }

        boolean success = bannerService.updateBanner(id, picUrl, sort, status);
        return success ? Result.success(true) : Result.error("更新失败");
    }

    @PostMapping("/delete/{id}")
    public Result<Boolean> deleteBanner(@PathVariable Long id) {
        boolean success = bannerService.deleteBanner(id);
        return success ? Result.success(true) : Result.error("删除失败");
    }
}

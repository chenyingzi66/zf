package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.Banner;

import java.util.List;

public interface BannerService extends IService<Banner> {
    List<Banner> getActiveBanners();
    boolean addBanner(String picUrl, Integer sort);
    boolean updateBanner(Long id, String picUrl, Integer sort, Integer status);
    boolean deleteBanner(Long id);
    List<Banner> getAllBanners();
}

package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.Banner;
import com.suixinzhu.mapper.BannerMapper;
import com.suixinzhu.service.BannerService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BannerServiceImpl extends ServiceImpl<BannerMapper, Banner> implements BannerService {

    @Override
    public List<Banner> getActiveBanners() {
        LambdaQueryWrapper<Banner> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Banner::getStatus, 1).orderByAsc(Banner::getSort);
        return this.list(wrapper);
    }

    @Override
    public boolean addBanner(String picUrl, Integer sort) {
        Banner banner = new Banner();
        banner.setPicUrl(picUrl);
        banner.setSort(sort != null ? sort : 0);
        banner.setStatus(1);
        banner.setCreateTime(LocalDateTime.now());
        banner.setUpdateTime(LocalDateTime.now());
        return this.save(banner);
    }

    @Override
    public boolean updateBanner(Long id, String picUrl, Integer sort, Integer status) {
        Banner banner = this.getById(id);
        if (banner == null) {
            return false;
        }
        if (picUrl != null && !picUrl.isEmpty()) {
            banner.setPicUrl(picUrl);
        }
        if (sort != null) {
            banner.setSort(sort);
        }
        if (status != null) {
            banner.setStatus(status);
        }
        banner.setUpdateTime(LocalDateTime.now());
        return this.updateById(banner);
    }

    @Override
    public boolean deleteBanner(Long id) {
        return this.removeById(id);
    }

    @Override
    public List<Banner> getAllBanners() {
        LambdaQueryWrapper<Banner> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Banner::getSort);
        return this.list(wrapper);
    }
}

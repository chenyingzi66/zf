package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.HouseCollect;
import com.suixinzhu.mapper.HouseCollectMapper;
import com.suixinzhu.service.HouseCollectService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HouseCollectServiceImpl extends ServiceImpl<HouseCollectMapper, HouseCollect> implements HouseCollectService {

    @Override
    public boolean addCollect(String userId, String houseId) {
        if (isCollected(userId, houseId)) {
            return false;
        }
        HouseCollect collect = new HouseCollect();
        collect.setUserId(userId);
        collect.setHouseId(houseId);
        collect.setCreateTime(LocalDateTime.now());
        return this.save(collect);
    }

    @Override
    public boolean removeCollect(String userId, String houseId) {
        LambdaQueryWrapper<HouseCollect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseCollect::getUserId, userId).eq(HouseCollect::getHouseId, houseId);
        return this.remove(wrapper);
    }

    @Override
    public boolean isCollected(String userId, String houseId) {
        LambdaQueryWrapper<HouseCollect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseCollect::getUserId, userId).eq(HouseCollect::getHouseId, houseId);
        return this.count(wrapper) > 0;
    }

    @Override
    public List<HouseCollect> getCollectList(String userId) {
        LambdaQueryWrapper<HouseCollect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseCollect::getUserId, userId).orderByDesc(HouseCollect::getCreateTime);
        return this.list(wrapper);
    }
}

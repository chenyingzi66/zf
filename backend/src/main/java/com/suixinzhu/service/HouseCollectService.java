package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.HouseCollect;

import java.util.List;

public interface HouseCollectService extends IService<HouseCollect> {
    boolean addCollect(String userId, String houseId);
    boolean removeCollect(String userId, String houseId);
    boolean isCollected(String userId, String houseId);
    List<HouseCollect> getCollectList(String userId);
}

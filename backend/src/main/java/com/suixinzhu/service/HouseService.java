package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.House;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface HouseService extends IService<House> {
    List<House> getActiveHouses(String province, String city, String district, BigDecimal minPrice, BigDecimal maxPrice, String houseType);
    House getByHouseId(String houseId);
    String generateHouseId();
    boolean publishHouse(String hostId, String title, String province, String city, String district, String address, BigDecimal price, String rentType, BigDecimal area, String houseType, String orientation, String floor, String pics, String facilities, String description);
    boolean updateHouse(String houseId, String title, String province, String city, String district, String address, BigDecimal price, String rentType, BigDecimal area, String houseType, String orientation, String floor, String pics, String facilities, String description);
    boolean updateStatus(String houseId, Integer status);
    boolean auditHouse(String houseId, Integer auditStatus, String auditRemark);
    boolean deleteHouse(String houseId);
    List<House> getHousesByHostId(String hostId);
    void incrementViewCount(String houseId);
}

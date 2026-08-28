package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.House;
import com.suixinzhu.mapper.HouseMapper;
import com.suixinzhu.service.HouseService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class HouseServiceImpl extends ServiceImpl<HouseMapper, House> implements HouseService {

    private static final AtomicInteger sequence = new AtomicInteger(1);

    @Override
    public List<House> getActiveHouses(String province, String city, String district, BigDecimal minPrice, BigDecimal maxPrice, String houseType) {
        LambdaQueryWrapper<House> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(House::getStatus, 1).eq(House::getAuditStatus, 1);
        
        if (province != null && !province.isEmpty()) {
            wrapper.eq(House::getProvince, province);
        }
        if (city != null && !city.isEmpty()) {
            wrapper.eq(House::getCity, city);
        }
        if (district != null && !district.isEmpty()) {
            wrapper.eq(House::getDistrict, district);
        }
        if (minPrice != null) {
            wrapper.ge(House::getPrice, minPrice);
        }
        if (maxPrice != null) {
            wrapper.le(House::getPrice, maxPrice);
        }
        if (houseType != null && !houseType.isEmpty()) {
            wrapper.like(House::getHouseType, houseType);
        }
        
        wrapper.orderByDesc(House::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public House getByHouseId(String houseId) {
        LambdaQueryWrapper<House> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(House::getHouseId, houseId);
        return this.getOne(wrapper);
    }

    @Override
    public String generateHouseId() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        int seq = sequence.getAndIncrement();
        if (seq > 9999) {
            sequence.set(1);
            seq = 1;
        }
        return "hours" + dateStr + String.format("%04d", seq);
    }

    @Override
    public boolean publishHouse(String hostId, String title, String province, String city, String district, String address, BigDecimal price, String rentType, BigDecimal area, String houseType, String orientation, String floor, String pics, String facilities, String description) {
        House house = new House();
        house.setHouseId(generateHouseId());
        house.setHostId(hostId);
        house.setTitle(title);
        house.setProvince(province != null ? province : "");
        house.setCity(city != null ? city : "");
        house.setDistrict(district != null ? district : "");
        house.setAddress(address != null ? address : "");
        house.setPrice(price);
        house.setRentType(rentType != null ? rentType : "月租");
        house.setArea(area != null ? area : BigDecimal.ZERO);
        house.setHouseType(houseType != null ? houseType : "");
        house.setOrientation(orientation != null ? orientation : "");
        house.setFloor(floor != null ? floor : "");
        house.setPics(pics != null ? pics : "[]");
        house.setFacilities(facilities != null ? facilities : "");
        house.setDescription(description != null ? description : "");
        house.setViewCount(0);
        house.setStatus(0);
        house.setAuditStatus(0);
        house.setAuditRemark("");
        house.setCreateTime(LocalDateTime.now());
        house.setUpdateTime(LocalDateTime.now());
        
        return this.save(house);
    }

    @Override
    public boolean updateHouse(String houseId, String title, String province, String city, String district, String address, BigDecimal price, String rentType, BigDecimal area, String houseType, String orientation, String floor, String pics, String facilities, String description) {
        House house = getByHouseId(houseId);
        if (house == null) {
            return false;
        }
        
        if (title != null) house.setTitle(title);
        if (province != null) house.setProvince(province);
        if (city != null) house.setCity(city);
        if (district != null) house.setDistrict(district);
        if (address != null) house.setAddress(address);
        if (price != null) house.setPrice(price);
        if (rentType != null) house.setRentType(rentType);
        if (area != null) house.setArea(area);
        if (houseType != null) house.setHouseType(houseType);
        if (orientation != null) house.setOrientation(orientation);
        if (floor != null) house.setFloor(floor);
        if (pics != null) house.setPics(pics);
        if (facilities != null) house.setFacilities(facilities);
        if (description != null) house.setDescription(description);
        
        house.setUpdateTime(LocalDateTime.now());
        return this.updateById(house);
    }

    @Override
    public boolean updateStatus(String houseId, Integer status) {
        House house = getByHouseId(houseId);
        if (house == null) {
            return false;
        }
        house.setStatus(status);
        house.setUpdateTime(LocalDateTime.now());
        return this.updateById(house);
    }

    @Override
    public boolean auditHouse(String houseId, Integer auditStatus, String auditRemark) {
        House house = getByHouseId(houseId);
        if (house == null) {
            return false;
        }
        house.setAuditStatus(auditStatus);
        house.setAuditRemark(auditRemark != null ? auditRemark : "");
        
        if (auditStatus == 1) {
            house.setStatus(1);
        } else if (auditStatus == 2) {
            house.setStatus(0);
        }
        
        house.setUpdateTime(LocalDateTime.now());
        return this.updateById(house);
    }

    @Override
    public boolean deleteHouse(String houseId) {
        House house = getByHouseId(houseId);
        if (house == null) {
            return false;
        }
        return this.removeById(house.getId());
    }

    @Override
    public List<House> getHousesByHostId(String hostId) {
        LambdaQueryWrapper<House> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(House::getHostId, hostId).orderByDesc(House::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public void incrementViewCount(String houseId) {
        House house = getByHouseId(houseId);
        if (house != null) {
            house.setViewCount(house.getViewCount() + 1);
            this.updateById(house);
        }
    }
}

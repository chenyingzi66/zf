package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.SysHost;
import com.suixinzhu.mapper.SysHostMapper;
import com.suixinzhu.service.HouseService;
import com.suixinzhu.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/house")
public class HouseController {

    @Autowired
    private HouseService houseService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SysHostMapper sysHostMapper;

    @GetMapping("/list")
    public Result<List<House>> getHouseList(
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String houseType) {
        List<House> houses = houseService.getActiveHouses(province, city, district, minPrice, maxPrice, houseType);
        return Result.success(houses);
    }

    @GetMapping("/detail/{houseId}")
    public Result<Map<String, Object>> getHouseDetail(@PathVariable String houseId) {
        House house = houseService.getByHouseId(houseId);
        if (house == null) {
            return Result.error("房源不存在");
        }
        houseService.incrementViewCount(houseId);
        
        Map<String, Object> data = new HashMap<>();
        data.put("houseId", house.getHouseId());
        data.put("title", house.getTitle());
        data.put("province", house.getProvince());
        data.put("city", house.getCity());
        data.put("district", house.getDistrict());
        data.put("address", house.getAddress());
        data.put("price", house.getPrice());
        data.put("rentType", house.getRentType());
        data.put("area", house.getArea());
        data.put("houseType", house.getHouseType());
        data.put("orientation", house.getOrientation());
        data.put("floor", house.getFloor());
        data.put("pics", house.getPics());
        data.put("facilities", house.getFacilities());
        data.put("description", house.getDescription());
        data.put("viewCount", house.getViewCount());
        data.put("status", house.getStatus());
        data.put("hostId", house.getHostId());
        
        LambdaQueryWrapper<SysHost> hostWrapper = new LambdaQueryWrapper<>();
        hostWrapper.eq(SysHost::getHostId, house.getHostId());
        SysHost host = sysHostMapper.selectOne(hostWrapper);
        if (host != null) {
            data.put("hostName", host.getName());
            data.put("hostAvatar", host.getAvatar());
            data.put("hostPhone", host.getPhone());
        }
        
        return Result.success(data);
    }

    @GetMapping("/host/list")
    public Result<List<House>> getHostHouses(@RequestHeader("Authorization") String token) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        List<House> houses = houseService.getHousesByHostId(hostId);
        return Result.success(houses);
    }

    @PostMapping("/publish")
    public Result<Map<String, Object>> publishHouse(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> params) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        
        String title = (String) params.get("title");
        String province = (String) params.get("province");
        String city = (String) params.get("city");
        String district = (String) params.get("district");
        String address = (String) params.get("address");
        BigDecimal price = params.get("price") != null ? new BigDecimal(params.get("price").toString()) : BigDecimal.ZERO;
        String rentType = (String) params.get("rentType");
        BigDecimal area = params.get("area") != null ? new BigDecimal(params.get("area").toString()) : BigDecimal.ZERO;
        String houseType = (String) params.get("houseType");
        String orientation = (String) params.get("orientation");
        String floor = (String) params.get("floor");
        String pics = (String) params.get("pics");
        String facilities = (String) params.get("facilities");
        String description = (String) params.get("description");

        if (title == null || title.isEmpty()) {
            return Result.error("房源标题不能为空");
        }

        boolean success = houseService.publishHouse(hostId, title, province, city, district, address, price, rentType, area, houseType, orientation, floor, pics, facilities, description);
        
        if (success) {
            Map<String, Object> data = new HashMap<>();
            data.put("message", "发布成功，等待审核");
            return Result.success(data);
        }
        return Result.error("发布失败");
    }

    @PostMapping("/update")
    public Result<Boolean> updateHouse(@RequestBody Map<String, Object> params) {
        String houseId = (String) params.get("houseId");
        String title = (String) params.get("title");
        String province = (String) params.get("province");
        String city = (String) params.get("city");
        String district = (String) params.get("district");
        String address = (String) params.get("address");
        BigDecimal price = params.get("price") != null ? new BigDecimal(params.get("price").toString()) : null;
        String rentType = (String) params.get("rentType");
        BigDecimal area = params.get("area") != null ? new BigDecimal(params.get("area").toString()) : null;
        String houseType = (String) params.get("houseType");
        String orientation = (String) params.get("orientation");
        String floor = (String) params.get("floor");
        String pics = (String) params.get("pics");
        String facilities = (String) params.get("facilities");
        String description = (String) params.get("description");

        boolean success = houseService.updateHouse(houseId, title, province, city, district, address, price, rentType, area, houseType, orientation, floor, pics, facilities, description);
        return success ? Result.success(true) : Result.error("更新失败");
    }

    @PostMapping("/status/{houseId}/{status}")
    public Result<Boolean> updateStatus(@PathVariable String houseId, @PathVariable Integer status) {
        boolean success = houseService.updateStatus(houseId, status);
        return success ? Result.success(true) : Result.error("操作失败");
    }

    @PostMapping("/audit")
    public Result<Boolean> auditHouse(@RequestBody Map<String, Object> params) {
        String houseId = (String) params.get("houseId");
        Integer auditStatus = (Integer) params.get("auditStatus");
        String auditRemark = (String) params.get("auditRemark");

        boolean success = houseService.auditHouse(houseId, auditStatus, auditRemark);
        return success ? Result.success(true) : Result.error("审核失败");
    }

    @PostMapping("/delete/{houseId}")
    public Result<Boolean> deleteHouse(@PathVariable String houseId) {
        boolean success = houseService.deleteHouse(houseId);
        return success ? Result.success(true) : Result.error("删除失败");
    }

    @GetMapping("/all")
    public Result<List<House>> getAllHouses() {
        List<House> houses = houseService.list();
        return Result.success(houses);
    }
    
    @GetMapping("/active")
    public Result<List<House>> getActiveHouses() {
        List<House> houses = houseService.getActiveHouses(null, null, null, null, null, null);
        return Result.success(houses);
    }
}

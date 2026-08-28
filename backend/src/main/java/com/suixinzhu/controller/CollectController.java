package com.suixinzhu.controller;

import com.suixinzhu.common.Result;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.HouseCollect;
import com.suixinzhu.service.HouseCollectService;
import com.suixinzhu.service.HouseService;
import com.suixinzhu.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/collect")
public class CollectController {

    @Autowired
    private HouseCollectService houseCollectService;

    @Autowired
    private HouseService houseService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/add")
    public Result<Boolean> addCollect(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        System.out.println("添加收藏 - token: " + token);
        System.out.println("添加收藏 - params: " + params);
        
        String userId = jwtUtils.getUserIdFromToken(token);
        String houseId = params.get("houseId");
        
        System.out.println("添加收藏 - userId: " + userId + ", houseId: " + houseId);

        if (houseId == null || houseId.isEmpty()) {
            return Result.error("房源ID不能为空");
        }

        boolean success = houseCollectService.addCollect(userId, houseId);
        System.out.println("添加收藏 - success: " + success);
        return success ? Result.success(true) : Result.error("已收藏");
    }

    @PostMapping("/cancel")
    public Result<Boolean> removeCollect(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        String userId = jwtUtils.getUserIdFromToken(token);
        String houseId = params.get("houseId");

        boolean success = houseCollectService.removeCollect(userId, houseId);
        return success ? Result.success(true) : Result.error("取消失败");
    }

    @GetMapping("/check/{houseId}")
    public Result<Map<String, Object>> checkCollect(@RequestHeader("Authorization") String token, @PathVariable String houseId) {
        String userId = jwtUtils.getUserIdFromToken(token);
        boolean isCollected = houseCollectService.isCollected(userId, houseId);
        Map<String, Object> data = new HashMap<>();
        data.put("isCollected", isCollected);
        return Result.success(data);
    }

    @GetMapping("/list")
    public Result<Map<String, Object>> getCollectList(@RequestHeader("Authorization") String token) {
        String userId = jwtUtils.getUserIdFromToken(token);
        List<HouseCollect> collectList = houseCollectService.getCollectList(userId);
        
        System.out.println("获取收藏列表 - userId: " + userId + ", 收藏数量: " + collectList.size());
        
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (HouseCollect collect : collectList) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", collect.getId());
            item.put("houseId", collect.getHouseId());
            item.put("createTime", collect.getCreateTime());
            
            // 获取房源详情 - 使用 houseId 字段查询
            House house = houseService.getByHouseId(collect.getHouseId());
            System.out.println("获取房源详情 - houseId: " + collect.getHouseId() + ", house: " + (house != null ? house.getTitle() : "null"));
            
            if (house != null) {
                item.put("title", house.getTitle());
                item.put("houseTitle", house.getTitle());
                item.put("price", house.getPrice());
                item.put("area", house.getArea());
                item.put("houseType", house.getHouseType());
                item.put("province", house.getProvince());
                item.put("city", house.getCity());
                item.put("district", house.getDistrict());
                item.put("address", house.getAddress());
                item.put("pics", house.getPics());
                item.put("facilities", house.getFacilities());
                item.put("hostId", house.getHostId());
                item.put("rentType", house.getRentType());
                item.put("floor", house.getFloor());
                item.put("orientation", house.getOrientation());
                item.put("description", house.getDescription());
            }
            
            resultList.add(item);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", resultList);
        result.put("total", resultList.size());
        
        return Result.success(result);
    }
}

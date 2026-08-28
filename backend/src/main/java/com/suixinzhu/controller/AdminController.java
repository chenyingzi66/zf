package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.*;
import com.suixinzhu.mapper.*;
import com.suixinzhu.utils.JwtUtils;
import com.suixinzhu.utils.MD5Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysHostMapper sysHostMapper;

    @Autowired
    private HouseMapper houseMapper;

    @Autowired
    private HouseOrderMapper houseOrderMapper;

    @Autowired
    private FeedbackMapper feedbackMapper;

    @Autowired
    private JwtUtils jwtUtils;

    private static String adminPasswordHash = "e10adc3949ba59abbe56e057f20f883e";

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");

        if (!"admin".equals(username)) {
            return Result.error("用户名或密码错误");
        }

        if (!MD5Utils.verify(password, adminPasswordHash)) {
            return Result.error("用户名或密码错误");
        }

        String token = jwtUtils.generateToken("admin", "ADMIN");

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("username", "admin");

        return Result.success(data);
    }

    @PostMapping("/changePassword")
    public Result<Boolean> changePassword(@RequestBody Map<String, String> params) {
        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");

        if (oldPassword == null || oldPassword.isEmpty()) {
            return Result.error("请输入原密码");
        }

        if (newPassword == null || newPassword.isEmpty()) {
            return Result.error("请输入新密码");
        }

        if (newPassword.length() < 6) {
            return Result.error("新密码长度不能少于6位");
        }

        if (!MD5Utils.verify(oldPassword, adminPasswordHash)) {
            return Result.error("原密码错误");
        }

        if (oldPassword.equals(newPassword)) {
            return Result.error("新密码不能与原密码相同");
        }

        adminPasswordHash = MD5Utils.encrypt(newPassword);

        return Result.success(true);
    }

    @GetMapping("/stat")
    public Result<Map<String, Object>> getStats() {
        long userCount = sysUserMapper.selectCount(null);
        long hostCount = sysHostMapper.selectCount(null);
        long houseCount = houseMapper.selectCount(null);
        long orderCount = houseOrderMapper.selectCount(null);

        Map<String, Object> stats = new HashMap<>();
        stats.put("userCount", userCount);
        stats.put("hostCount", hostCount);
        stats.put("houseCount", houseCount);
        stats.put("orderCount", orderCount);

        return Result.success(stats);
    }

    @GetMapping("/user/list")
    public Result<List<SysUser>> getUserList() {
        List<SysUser> users = sysUserMapper.selectList(null);
        return Result.success(users);
    }

    @PostMapping("/user/delete")
    public Result<Boolean> deleteUser(@RequestBody Map<String, String> params) {
        String userId = params.get("userId");
        if (userId == null || userId.isEmpty()) {
            return Result.error("用户ID不能为空");
        }

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUserId, userId);
        int deleted = sysUserMapper.delete(wrapper);

        if (deleted > 0) {
            return Result.success(true);
        } else {
            return Result.error("删除失败，用户不存在");
        }
    }

    @GetMapping("/host/list")
    public Result<List<SysHost>> getHostList() {
        List<SysHost> hosts = sysHostMapper.selectList(null);
        return Result.success(hosts);
    }

    @PostMapping("/host/audit")
    public Result<Boolean> auditHost(@RequestBody Map<String, Object> params) {
        String hostId = (String) params.get("hostId");
        Integer certStatus = (Integer) params.get("certStatus");

        LambdaQueryWrapper<SysHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysHost::getHostId, hostId);
        SysHost host = sysHostMapper.selectOne(wrapper);

        if (host == null) {
            return Result.error("房东不存在");
        }

        host.setCertStatus(certStatus);
        sysHostMapper.updateById(host);

        return Result.success(true);
    }

    @PostMapping("/host/delete")
    public Result<Boolean> deleteHost(@RequestBody Map<String, String> params) {
        String hostId = params.get("hostId");
        if (hostId == null || hostId.isEmpty()) {
            return Result.error("房东ID不能为空");
        }

        LambdaQueryWrapper<SysHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysHost::getHostId, hostId);
        int deleted = sysHostMapper.delete(wrapper);

        if (deleted > 0) {
            return Result.success(true);
        } else {
            return Result.error("删除失败，房东不存在");
        }
    }

    @GetMapping("/house/list")
    public Result<List<House>> getHouseList() {
        List<House> houses = houseMapper.selectList(null);
        return Result.success(houses);
    }

    @PostMapping("/house/audit")
    public Result<Boolean> auditHouse(@RequestBody Map<String, Object> params) {
        String houseId = (String) params.get("houseId");
        Integer auditStatus = (Integer) params.get("auditStatus");
        String auditRemark = (String) params.get("auditRemark");

        LambdaQueryWrapper<House> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(House::getHouseId, houseId);
        House house = houseMapper.selectOne(wrapper);

        if (house == null) {
            return Result.error("房源不存在");
        }

        house.setAuditStatus(auditStatus);
        house.setAuditRemark(auditRemark != null ? auditRemark : "");
        
        if (auditStatus == 1) {
            house.setStatus(1);
        } else if (auditStatus == 2) {
            house.setStatus(0);
        }
        
        houseMapper.updateById(house);

        return Result.success(true);
    }

    @GetMapping("/order/list")
    public Result<List<HouseOrder>> getOrderList() {
        List<HouseOrder> orders = houseOrderMapper.selectList(null);
        return Result.success(orders);
    }

    @GetMapping("/feedback/list")
    public Result<List<Feedback>> getFeedbackList() {
        List<Feedback> feedbacks = feedbackMapper.selectList(null);
        return Result.success(feedbacks);
    }
}

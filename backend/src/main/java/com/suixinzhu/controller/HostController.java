package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.SysHost;
import com.suixinzhu.service.SysHostService;
import com.suixinzhu.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/host")
public class HostController {

    @Autowired
    private SysHostService sysHostService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String password = params.get("password");
        String code = params.get("code");
        String name = params.get("name");

        try {
            Map<String, Object> data = sysHostService.register(phone, password, code, name);
            return Result.success(data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String password = params.get("password");

        try {
            Map<String, Object> data = sysHostService.login(phone, password);
            return Result.success(data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/sms")
    public Result<String> sendSms(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            return Result.error("手机号格式不正确");
        }
        return Result.success("验证码已发送，演示验证码为 123456");
    }

    @GetMapping("/info")
    public Result<Map<String, Object>> getInfo(@RequestHeader("Authorization") String token) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        SysHost host = sysHostService.getByHostId(hostId);

        if (host == null) {
            return Result.error("房东不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("hostId", host.getHostId());
        data.put("name", host.getName());
        data.put("phone", host.getPhone());
        data.put("avatar", host.getAvatar());
        data.put("certStatus", host.getCertStatus());
        data.put("realName", host.getRealName());
        data.put("idCard", host.getIdCard());

        return Result.success(data);
    }

    @PostMapping("/update")
    public Result<Boolean> updateInfo(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        String name = params.get("name");
        String avatar = params.get("avatar");
        String realName = params.get("realName");
        String idCard = params.get("idCard");

        boolean success = sysHostService.updateHostInfo(hostId, name, avatar, realName, idCard);
        return success ? Result.success(true) : Result.error("更新失败");
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats(@RequestHeader("Authorization") String token) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        Map<String, Object> stats = sysHostService.getStats(hostId);
        return Result.success(stats);
    }
}

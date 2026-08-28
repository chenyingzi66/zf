package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.SysUser;
import com.suixinzhu.service.SysUserService;
import com.suixinzhu.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        String password = params.get("password");
        String code = params.get("code");

        try {
            Map<String, Object> data = sysUserService.register(phone, password, code);
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
            Map<String, Object> data = sysUserService.login(phone, password);
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
        String userId = jwtUtils.getUserIdFromToken(token);
        SysUser user = sysUserService.getByUserId(userId);
        
        if (user == null) {
            return Result.error("用户不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getUserId());
        data.put("nickname", user.getNickname());
        data.put("phone", user.getPhone());
        data.put("avatar", user.getAvatar());
        data.put("realName", user.getRealName());
        data.put("idCard", user.getIdCard());

        return Result.success(data);
    }

    @PostMapping("/update")
    public Result<Boolean> updateInfo(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        String userId = jwtUtils.getUserIdFromToken(token);
        String nickname = params.get("nickname");
        String avatar = params.get("avatar");

        boolean success = sysUserService.updateUserInfo(userId, nickname, avatar);
        return success ? Result.success(true) : Result.error("更新失败");
    }
}

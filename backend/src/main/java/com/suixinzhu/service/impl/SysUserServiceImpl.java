package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.SysUser;
import com.suixinzhu.mapper.SysUserMapper;
import com.suixinzhu.service.SysUserService;
import com.suixinzhu.utils.JwtUtils;
import com.suixinzhu.utils.MD5Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public Map<String, Object> register(String phone, String password, String code) {
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            throw new RuntimeException("手机号格式不正确");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }
        
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getPhone, phone);
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("手机号已被注册");
        }

        SysUser user = new SysUser();
        user.setUserId("user" + phone);
        user.setPhone(phone);
        user.setPassword(MD5Utils.encrypt(password));
        user.setNickname("租客_" + phone.substring(phone.length() - 4));
        user.setAvatar("");
        user.setRealName("");
        user.setIdCard("");
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        
        this.save(user);

        String token = jwtUtils.generateToken(user.getUserId(), "USER");
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getUserId());
        result.put("nickname", user.getNickname());
        result.put("phone", user.getPhone());
        result.put("avatar", user.getAvatar());
        
        return result;
    }

    @Override
    public Map<String, Object> login(String phone, String password) {
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            throw new RuntimeException("手机号格式不正确");
        }
        if (password == null || password.isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getPhone, phone);
        SysUser user = this.getOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在，请先注册");
        }

        if (!MD5Utils.verify(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtils.generateToken(user.getUserId(), "USER");
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getUserId());
        result.put("nickname", user.getNickname());
        result.put("phone", user.getPhone());
        result.put("avatar", user.getAvatar());
        
        return result;
    }

    @Override
    public SysUser getByUserId(String userId) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUserId, userId);
        return this.getOne(wrapper);
    }

    @Override
    public boolean updateUserInfo(String userId, String nickname, String avatar) {
        SysUser user = getByUserId(userId);
        if (user == null) {
            return false;
        }
        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(avatar);
        }
        user.setUpdateTime(LocalDateTime.now());
        return this.updateById(user);
    }
}

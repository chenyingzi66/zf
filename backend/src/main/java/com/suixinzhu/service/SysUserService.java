package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.SysUser;

import java.util.Map;

public interface SysUserService extends IService<SysUser> {
    Map<String, Object> register(String phone, String password, String code);
    Map<String, Object> login(String phone, String password);
    SysUser getByUserId(String userId);
    boolean updateUserInfo(String userId, String nickname, String avatar);
}

package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.SysHost;

import java.util.Map;

public interface SysHostService extends IService<SysHost> {
    Map<String, Object> register(String phone, String password, String code, String name);
    Map<String, Object> login(String phone, String password);
    SysHost getByHostId(String hostId);
    boolean updateHostInfo(String hostId, String name, String avatar, String realName, String idCard);
    Map<String, Object> getStats(String hostId);
}

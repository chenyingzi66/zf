package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.HouseOrder;
import com.suixinzhu.entity.SysHost;
import com.suixinzhu.mapper.HouseMapper;
import com.suixinzhu.mapper.HouseOrderMapper;
import com.suixinzhu.mapper.SysHostMapper;
import com.suixinzhu.service.SysHostService;
import com.suixinzhu.utils.JwtUtils;
import com.suixinzhu.utils.MD5Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysHostServiceImpl extends ServiceImpl<SysHostMapper, SysHost> implements SysHostService {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private HouseMapper houseMapper;

    @Autowired
    private HouseOrderMapper houseOrderMapper;

    @Override
    public Map<String, Object> register(String phone, String password, String code, String name) {
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            throw new RuntimeException("手机号格式不正确");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }

        LambdaQueryWrapper<SysHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysHost::getPhone, phone);
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("手机号已被注册");
        }

        SysHost host = new SysHost();
        host.setHostId("host" + phone);
        host.setPhone(phone);
        host.setPassword(MD5Utils.encrypt(password));
        host.setName(name != null && !name.isEmpty() ? name : "房东_" + phone.substring(phone.length() - 4));
        host.setAvatar("");
        host.setRealName("");
        host.setIdCard("");
        host.setCertStatus(0);
        host.setStatus(1);
        host.setCreateTime(LocalDateTime.now());
        host.setUpdateTime(LocalDateTime.now());

        this.save(host);

        String token = jwtUtils.generateToken(host.getHostId(), "HOST");

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("hostId", host.getHostId());
        result.put("name", host.getName());
        result.put("phone", host.getPhone());
        result.put("avatar", host.getAvatar());
        result.put("certStatus", host.getCertStatus());

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

        LambdaQueryWrapper<SysHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysHost::getPhone, phone);
        SysHost host = this.getOne(wrapper);

        if (host == null) {
            throw new RuntimeException("房东不存在，请先注册");
        }

        if (host.getStatus() != null && host.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }

        if (!MD5Utils.verify(password, host.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtils.generateToken(host.getHostId(), "HOST");

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("hostId", host.getHostId());
        result.put("name", host.getName());
        result.put("phone", host.getPhone());
        result.put("avatar", host.getAvatar());
        result.put("certStatus", host.getCertStatus());
        result.put("realName", host.getRealName());
        result.put("idCard", host.getIdCard());

        return result;
    }

    @Override
    public SysHost getByHostId(String hostId) {
        LambdaQueryWrapper<SysHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysHost::getHostId, hostId);
        return this.getOne(wrapper);
    }

    @Override
    public boolean updateHostInfo(String hostId, String name, String avatar, String realName, String idCard) {
        SysHost host = getByHostId(hostId);
        if (host == null) {
            return false;
        }
        if (name != null && !name.isEmpty()) {
            host.setName(name);
        }
        if (avatar != null && !avatar.isEmpty()) {
            host.setAvatar(avatar);
        }
        if (realName != null) {
            host.setRealName(realName);
        }
        if (idCard != null && !idCard.isEmpty()) {
            if (!idCard.matches("^\\d{17}[\\dXx]$")) {
                throw new RuntimeException("身份证号格式不正确");
            }
            host.setIdCard(idCard);
        }
        host.setUpdateTime(LocalDateTime.now());
        return this.updateById(host);
    }

    @Override
    public Map<String, Object> getStats(String hostId) {
        LambdaQueryWrapper<House> houseWrapper = new LambdaQueryWrapper<>();
        houseWrapper.eq(House::getHostId, hostId);
        Long totalHouses = houseMapper.selectCount(houseWrapper);

        LambdaQueryWrapper<House> rentedWrapper = new LambdaQueryWrapper<>();
        rentedWrapper.eq(House::getHostId, hostId).eq(House::getStatus, 1);
        Long rentedHouses = houseMapper.selectCount(rentedWrapper);

        LambdaQueryWrapper<HouseOrder> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(HouseOrder::getHostId, hostId).eq(HouseOrder::getOrderStatus, 0);
        Long pendingOrders = houseOrderMapper.selectCount(pendingWrapper);

        // 计算本月收益（已支付或已完成的订单，且创建时间在本月内）
        LocalDateTime monthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime monthEnd = LocalDateTime.now();
        LambdaQueryWrapper<HouseOrder> incomeWrapper = new LambdaQueryWrapper<>();
        incomeWrapper.eq(HouseOrder::getHostId, hostId)
                .in(HouseOrder::getOrderStatus, 2, 3)
                .ge(HouseOrder::getCreateTime, monthStart)
                .le(HouseOrder::getCreateTime, monthEnd);
        
        System.out.println("本月收益统计 - hostId: " + hostId + ", 本月开始: " + monthStart + ", 本月结束: " + monthEnd);
        
        BigDecimal monthIncome = BigDecimal.ZERO;
        List<HouseOrder> incomeOrders = houseOrderMapper.selectList(incomeWrapper);
        System.out.println("本月收益统计 - 符合条件的订单数: " + incomeOrders.size());
        
        for (HouseOrder order : incomeOrders) {
            System.out.println("订单: " + order.getOrderNo() + ", 状态: " + order.getOrderStatus() + ", 金额: " + order.getTotalAmount() + ", 创建时间: " + order.getCreateTime());
            if (order.getTotalAmount() != null) {
                monthIncome = monthIncome.add(order.getTotalAmount());
            }
        }
        
        System.out.println("本月收益统计 - 总计: " + monthIncome);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalHouses", totalHouses);
        stats.put("rentedHouses", rentedHouses);
        stats.put("pendingOrders", pendingOrders);
        stats.put("monthIncome", monthIncome);

        return stats;
    }
}

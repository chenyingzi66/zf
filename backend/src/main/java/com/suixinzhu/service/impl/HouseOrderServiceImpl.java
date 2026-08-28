package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.HouseOrder;
import com.suixinzhu.entity.RentContract;
import com.suixinzhu.mapper.HouseMapper;
import com.suixinzhu.mapper.HouseOrderMapper;
import com.suixinzhu.mapper.RentContractMapper;
import com.suixinzhu.service.HouseOrderService;
import com.suixinzhu.websocket.WebSocketServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class HouseOrderServiceImpl extends ServiceImpl<HouseOrderMapper, HouseOrder> implements HouseOrderService {

    private static final AtomicInteger sequence = new AtomicInteger(1);

    @Autowired
    private HouseMapper houseMapper;

    @Autowired
    private RentContractMapper rentContractMapper;

    @Override
    public String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int seq = sequence.getAndIncrement();
        if (seq > 9999) {
            sequence.set(1);
            seq = 1;
        }
        return "SXZ" + dateStr + String.format("%04d", seq);
    }

    @Override
    public Map<String, Object> createOrder(String userId, String houseId, String checkInDate, String checkOutDate, String remark) {
        LambdaQueryWrapper<House> houseWrapper = new LambdaQueryWrapper<>();
        houseWrapper.eq(House::getHouseId, houseId);
        House house = houseMapper.selectOne(houseWrapper);

        if (house == null) {
            throw new RuntimeException("房源不存在");
        }

        if (house.getStatus() != 1 || house.getAuditStatus() != 1) {
            throw new RuntimeException("房源不可预订");
        }

        HouseOrder order = new HouseOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setHostId(house.getHostId());
        order.setHouseId(houseId);
        order.setHouseTitle(house.getTitle());
        order.setRentPrice(house.getPrice());
        order.setRentType(house.getRentType());

        if (checkInDate != null && !checkInDate.isEmpty()) {
            order.setCheckInDate(LocalDate.parse(checkInDate));
        }
        if (checkOutDate != null && !checkOutDate.isEmpty()) {
            order.setCheckOutDate(LocalDate.parse(checkOutDate));
        }

        if (order.getCheckInDate() != null && order.getCheckOutDate() != null) {
            long days = ChronoUnit.DAYS.between(order.getCheckInDate(), order.getCheckOutDate());
            if (days <= 0) days = 30;
            order.setTotalAmount(house.getPrice().multiply(BigDecimal.valueOf(days / 30.0)));
        } else {
            order.setTotalAmount(house.getPrice());
        }

        order.setOrderStatus(0);
        order.setRealName("");
        order.setIdCard("");
        order.setPhone("");
        order.setContractSigned(0);
        order.setRemark(remark != null ? remark : "");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        this.save(order);

        WebSocketServer.sendMessage(order.getHostId(), "NEW_ORDER");

        Map<String, Object> result = new HashMap<>();
        result.put("orderNo", order.getOrderNo());
        result.put("message", "预订成功");
        return result;
    }

    @Override
    public HouseOrder getByOrderNo(String orderNo) {
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseOrder::getOrderNo, orderNo);
        return this.getOne(wrapper);
    }

    @Override
    public boolean updateOrderStatus(String orderNo, Integer status) {
        HouseOrder order = getByOrderNo(orderNo);
        if (order == null) {
            return false;
        }
        order.setOrderStatus(status);
        order.setUpdateTime(LocalDateTime.now());
        boolean success = this.updateById(order);

        if (success) {
            WebSocketServer.sendMessage(order.getUserId(), "ORDER_STATUS_UPDATE");
            WebSocketServer.sendMessage(order.getHostId(), "ORDER_STATUS_UPDATE");
        }

        return success;
    }

    @Override
    public boolean checkIn(String orderNo, String realName, String idCard, String phone) {
        HouseOrder order = getByOrderNo(orderNo);
        if (order == null) {
            return false;
        }

        if (order.getOrderStatus() != 1) {
            throw new RuntimeException("订单状态不允许办理入住");
        }

        order.setRealName(realName);
        order.setIdCard(idCard);
        order.setPhone(phone);
        order.setContractSigned(1);
        order.setOrderStatus(2);
        order.setUpdateTime(LocalDateTime.now());

        RentContract contract = new RentContract();
        contract.setOrderNo(orderNo);
        contract.setUserId(order.getUserId());
        contract.setHostId(order.getHostId());
        contract.setHouseId(order.getHouseId());
        contract.setRealName(realName);
        contract.setIdCard(idCard);
        contract.setPhone(phone);
        contract.setSignTime(LocalDateTime.now());
        contract.setContractUrl("");
        contract.setCreateTime(LocalDateTime.now());
        rentContractMapper.insert(contract);

        boolean success = this.updateById(order);

        if (success) {
            WebSocketServer.sendMessage(order.getHostId(), "TENANT_CHECKED_IN");
        }

        return success;
    }

    @Override
    public boolean deleteOrderByOrderNo(String orderNo) {
        HouseOrder order = getByOrderNo(orderNo);
        if (order == null) {
            return false;
        }
        return this.removeById(order.getId());
    }

    @Override
    public List<HouseOrder> getOrdersByUserId(String userId, Integer status) {
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseOrder::getUserId, userId);
        if (status != null) {
            wrapper.eq(HouseOrder::getOrderStatus, status);
        }
        wrapper.orderByDesc(HouseOrder::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public List<HouseOrder> getOrdersByHostId(String hostId, Integer status) {
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseOrder::getHostId, hostId);
        if (status != null) {
            wrapper.eq(HouseOrder::getOrderStatus, status);
        }
        wrapper.orderByDesc(HouseOrder::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public List<HouseOrder> getPendingOrdersByHostId(String hostId) {
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseOrder::getHostId, hostId).eq(HouseOrder::getOrderStatus, 0);
        wrapper.orderByDesc(HouseOrder::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public List<HouseOrder> getAllOrders() {
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(HouseOrder::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public int autoCompleteExpiredOrders() {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<HouseOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HouseOrder::getOrderStatus, 2);
        wrapper.isNotNull(HouseOrder::getCheckOutDate);
        wrapper.lt(HouseOrder::getCheckOutDate, today);
        List<HouseOrder> expiredOrders = this.list(wrapper);

        int count = 0;
        for (HouseOrder order : expiredOrders) {
            order.setOrderStatus(3);
            order.setUpdateTime(LocalDateTime.now());
            this.updateById(order);
            WebSocketServer.sendMessage(order.getUserId(), "ORDER_STATUS_UPDATE");
            WebSocketServer.sendMessage(order.getHostId(), "ORDER_STATUS_UPDATE");
            count++;
        }
        return count;
    }
}

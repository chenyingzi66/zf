package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.HouseOrder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface HouseOrderService extends IService<HouseOrder> {
    String generateOrderNo();
    Map<String, Object> createOrder(String userId, String houseId, String checkInDate, String checkOutDate, String remark);
    HouseOrder getByOrderNo(String orderNo);
    boolean updateOrderStatus(String orderNo, Integer status);
    boolean checkIn(String orderNo, String realName, String idCard, String phone);
    boolean deleteOrderByOrderNo(String orderNo);
    List<HouseOrder> getOrdersByUserId(String userId, Integer status);
    List<HouseOrder> getOrdersByHostId(String hostId, Integer status);
    List<HouseOrder> getPendingOrdersByHostId(String hostId);
    List<HouseOrder> getAllOrders();
    int autoCompleteExpiredOrders();
}

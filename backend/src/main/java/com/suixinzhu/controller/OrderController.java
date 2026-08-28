package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.HouseOrder;
import com.suixinzhu.entity.SysHost;
import com.suixinzhu.entity.SysUser;
import com.suixinzhu.mapper.HouseMapper;
import com.suixinzhu.mapper.SysHostMapper;
import com.suixinzhu.mapper.SysUserMapper;
import com.suixinzhu.service.HouseOrderService;
import com.suixinzhu.utils.JwtUtils;
import com.suixinzhu.websocket.WebSocketServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private HouseOrderService houseOrderService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private HouseMapper houseMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysHostMapper sysHostMapper;

    private static final AtomicInteger sequence = new AtomicInteger(1);

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int seq = sequence.getAndIncrement();
        if (seq > 9999) {
            sequence.set(1);
            seq = 1;
        }
        return "SXZ" + dateStr + String.format("%04d", seq);
    }

    @PostMapping("/create")
    public Result<Map<String, Object>> createOrder(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> params) {
        String userId = jwtUtils.getUserIdFromToken(token);
        
        String houseId = (String) params.get("houseId");
        String houseTitle = (String) params.get("houseTitle");
        String houseImage = (String) params.get("houseImage");
        String houseAddress = (String) params.get("houseAddress");
        String hostId = (String) params.get("hostId");
        String guestName = (String) params.get("guestName");
        String guestPhone = (String) params.get("guestPhone");
        String startDate = (String) params.get("startDate");
        String endDate = (String) params.get("endDate");
        Integer days = params.get("days") != null ? ((Number) params.get("days")).intValue() : 30;
        Integer months = params.get("months") != null ? ((Number) params.get("months")).intValue() : 1;
        Integer rentCount = params.get("rentCount") != null ? ((Number) params.get("rentCount")).intValue() : 1;
        String rentType = (String) params.get("rentType");
        BigDecimal unitPrice = params.get("unitPrice") != null ? new BigDecimal(params.get("unitPrice").toString()) : BigDecimal.ZERO;
        BigDecimal rentAmount = params.get("rentAmount") != null ? new BigDecimal(params.get("rentAmount").toString()) : BigDecimal.ZERO;
        BigDecimal deposit = params.get("deposit") != null ? new BigDecimal(params.get("deposit").toString()) : BigDecimal.ZERO;
        BigDecimal totalAmount = params.get("totalAmount") != null ? new BigDecimal(params.get("totalAmount").toString()) : BigDecimal.ZERO;
        BigDecimal housePrice = params.get("housePrice") != null ? new BigDecimal(params.get("housePrice").toString()) : BigDecimal.ZERO;
        String remark = (String) params.get("remark");

        HouseOrder order = new HouseOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setHostId(hostId);
        order.setHouseId(houseId);
        order.setHouseTitle(houseTitle);
        order.setHouseImage(houseImage);
        order.setHouseAddress(houseAddress);
        order.setHousePrice(housePrice);
        order.setRentPrice(housePrice);
        order.setRentType(rentType != null ? rentType : "月租");
        
        if (startDate != null && !startDate.isEmpty()) {
            order.setCheckInDate(LocalDate.parse(startDate));
        }
        if (endDate != null && !endDate.isEmpty()) {
            order.setCheckOutDate(LocalDate.parse(endDate));
        }
        
        order.setDays(days);
        order.setMonths(months);
        order.setRentCount(rentCount);
        order.setUnitPrice(unitPrice);
        order.setRentAmount(rentAmount);
        order.setDeposit(deposit);
        order.setTotalAmount(totalAmount);
        order.setOrderStatus(0);
        order.setGuestName(guestName);
        order.setGuestPhone(guestPhone);
        order.setRealName("");
        order.setIdCard("");
        order.setPhone(guestPhone != null ? guestPhone : "");
        order.setContractSigned(0);
        order.setRemark(remark != null ? remark : "");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        houseOrderService.save(order);

        WebSocketServer.sendMessage(hostId, "NEW_ORDER");

        Map<String, Object> result = new HashMap<>();
        result.put("orderNo", order.getOrderNo());
        result.put("id", order.getId());
        result.put("message", "预订成功");
        return Result.success(result);
    }

    @GetMapping("/user/list")
    public Result<List<HouseOrder>> getUserOrders(@RequestHeader("Authorization") String token, @RequestParam(required = false) Integer status) {
        String userId = jwtUtils.getUserIdFromToken(token);
        List<HouseOrder> orders = houseOrderService.getOrdersByUserId(userId, status);
        return Result.success(orders);
    }

    @GetMapping("/host/list")
    public Result<List<HouseOrder>> getHostOrders(@RequestHeader("Authorization") String token, @RequestParam(required = false) Integer status) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        List<HouseOrder> orders = houseOrderService.getOrdersByHostId(hostId, status);
        return Result.success(orders);
    }

    @GetMapping("/host/pending")
    public Result<List<HouseOrder>> getHostPendingOrders(@RequestHeader("Authorization") String token) {
        String hostId = jwtUtils.getUserIdFromToken(token);
        List<HouseOrder> orders = houseOrderService.getPendingOrdersByHostId(hostId);
        return Result.success(orders);
    }

    @GetMapping("/detail/{id}")
    public Result<Map<String, Object>> getOrderDetail(@PathVariable Long id) {
        HouseOrder order = houseOrderService.getById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", order.getId());
        data.put("orderNo", order.getOrderNo());
        data.put("userId", order.getUserId());
        data.put("hostId", order.getHostId());
        data.put("houseId", order.getHouseId());
        data.put("houseTitle", order.getHouseTitle());
        data.put("houseImage", order.getHouseImage());
        data.put("houseAddress", order.getHouseAddress());
        data.put("housePrice", order.getHousePrice());
        data.put("rentPrice", order.getRentPrice());
        data.put("rentType", order.getRentType());
        data.put("checkInDate", order.getCheckInDate());
        data.put("checkOutDate", order.getCheckOutDate());
        data.put("startDate", order.getCheckInDate());
        data.put("endDate", order.getCheckOutDate());
        data.put("days", order.getDays());
        data.put("months", order.getMonths());
        data.put("rentCount", order.getRentCount());
        data.put("unitPrice", order.getUnitPrice());
        data.put("rentAmount", order.getRentAmount());
        data.put("deposit", order.getDeposit());
        data.put("totalAmount", order.getTotalAmount());
        data.put("orderStatus", order.getOrderStatus());
        data.put("guestName", order.getGuestName());
        data.put("guestPhone", order.getGuestPhone());
        data.put("realName", order.getRealName());
        data.put("idCard", order.getIdCard());
        data.put("phone", order.getPhone());
        data.put("contractSigned", order.getContractSigned());
        data.put("remark", order.getRemark());
        data.put("createTime", order.getCreateTime());

        LambdaQueryWrapper<SysHost> hostWrapper = new LambdaQueryWrapper<>();
        hostWrapper.eq(SysHost::getHostId, order.getHostId());
        SysHost host = sysHostMapper.selectOne(hostWrapper);
        if (host != null) {
            data.put("landlordName", host.getName());
            data.put("landlordPhone", host.getPhone());
            data.put("landlordAvatar", host.getAvatar());
        } else {
            data.put("landlordName", "房东");
            data.put("landlordPhone", "");
            data.put("landlordAvatar", "");
        }

        return Result.success(data);
    }

    @PostMapping("/status")
    public Result<Boolean> updateOrderStatus(@RequestBody Map<String, Object> params) {
        String orderNo = (String) params.get("orderNo");
        Integer status = (Integer) params.get("status");

        try {
            boolean success = houseOrderService.updateOrderStatus(orderNo, status);
            return success ? Result.success(true) : Result.error("操作失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/checkin")
    public Result<Boolean> checkIn(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        String orderNo = params.get("orderNo");
        String realName = params.get("realName");
        String idCard = params.get("idCard");
        String phone = params.get("phone");

        try {
            boolean success = houseOrderService.checkIn(orderNo, realName, idCard, phone);
            return success ? Result.success(true) : Result.error("办理入住失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/all")
    public Result<List<HouseOrder>> getAllOrders() {
        List<HouseOrder> orders = houseOrderService.getAllOrders();
        return Result.success(orders);
    }

    @PostMapping("/delete/{orderNo}")
    public Result<Boolean> deleteOrder(@PathVariable String orderNo) {
        boolean success = houseOrderService.deleteOrderByOrderNo(orderNo);
        return success ? Result.success(true) : Result.error("删除失败");
    }
}

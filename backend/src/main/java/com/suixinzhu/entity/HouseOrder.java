package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("house_order")
public class HouseOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private String userId;
    private String hostId;
    private String houseId;
    private String houseTitle;
    private String houseImage;
    private String houseAddress;
    private BigDecimal housePrice;
    private BigDecimal rentPrice;
    private String rentType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer days;
    private Integer months;
    private Integer rentCount;
    private BigDecimal unitPrice;
    private BigDecimal rentAmount;
    private BigDecimal deposit;
    private BigDecimal totalAmount;
    private Integer orderStatus;
    private String guestName;
    private String guestPhone;
    private String realName;
    private String idCard;
    private String phone;
    private Integer contractSigned;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

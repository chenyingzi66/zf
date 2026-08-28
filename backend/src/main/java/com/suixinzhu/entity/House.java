package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("house")
public class House {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String houseId;
    private String hostId;
    private String title;
    private String province;
    private String city;
    private String district;
    private String address;
    private BigDecimal price;
    private String rentType;
    private BigDecimal area;
    private String houseType;
    private String orientation;
    private String floor;
    private String pics;
    private String facilities;
    private String description;
    private Integer viewCount;
    private Integer status;
    private Integer auditStatus;
    private String auditRemark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

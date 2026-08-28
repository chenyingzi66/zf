package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("rent_contract")
public class RentContract {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private String userId;
    private String hostId;
    private String houseId;
    private String realName;
    private String idCard;
    private String phone;
    private LocalDateTime signTime;
    private String contractUrl;
    private LocalDateTime createTime;
}

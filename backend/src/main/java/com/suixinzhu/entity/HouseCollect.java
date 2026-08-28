package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("house_collect")
public class HouseCollect {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String userId;
    private String houseId;
    private LocalDateTime createTime;
}

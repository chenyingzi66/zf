package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_host")
public class SysHost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String hostId;
    private String phone;
    private String name;
    private String avatar;
    private String password;
    private String realName;
    private String idCard;
    private Integer certStatus;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

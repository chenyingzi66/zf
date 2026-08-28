package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_user")
public class SysUser {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String userId;
    private String phone;
    private String nickname;
    private String avatar;
    private String password;
    private String realName;
    private String idCard;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

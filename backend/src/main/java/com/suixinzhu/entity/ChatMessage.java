package com.suixinzhu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("chat_message")
public class ChatMessage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String landlordId;
    private String houseId;
    private String sendId;
    private String receiveId;
    private String content;
    private Integer isRead;
    private LocalDateTime createTime;
}

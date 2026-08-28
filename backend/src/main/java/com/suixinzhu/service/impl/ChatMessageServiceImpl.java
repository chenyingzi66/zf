package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.ChatMessage;
import com.suixinzhu.mapper.ChatMessageMapper;
import com.suixinzhu.service.ChatMessageService;
import com.suixinzhu.websocket.WebSocketServer;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatMessageServiceImpl extends ServiceImpl<ChatMessageMapper, ChatMessage> implements ChatMessageService {

    @Override
    public boolean sendMessage(String sendId, String receiveId, String content) {
        return sendMessage(sendId, receiveId, content, null, null, null);
    }

    @Override
    public boolean sendMessage(String sendId, String receiveId, String content, String tenantId, String landlordId, String houseId) {
        ChatMessage message = new ChatMessage();
        message.setSendId(sendId);
        message.setReceiveId(receiveId);
        message.setContent(content);
        message.setTenantId(tenantId);
        message.setLandlordId(landlordId);
        message.setHouseId(houseId);
        message.setIsRead(0);
        message.setCreateTime(LocalDateTime.now());

        boolean success = this.save(message);

        if (success) {
            WebSocketServer.sendMessage(receiveId, "NEW_MESSAGE");
        }

        return success;
    }

    @Override
    public List<ChatMessage> getChatHistory(String sendId, String receiveId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(ChatMessage::getSendId, sendId).eq(ChatMessage::getReceiveId, receiveId)
                .or()
                .eq(ChatMessage::getSendId, receiveId).eq(ChatMessage::getReceiveId, sendId));
        wrapper.orderByAsc(ChatMessage::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public List<ChatMessage> getChatHistoryByConversation(String tenantId, String landlordId, String houseId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getTenantId, tenantId)
               .eq(ChatMessage::getLandlordId, landlordId)
               .eq(ChatMessage::getHouseId, houseId);
        wrapper.orderByAsc(ChatMessage::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public void markAsRead(String sendId, String receiveId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getSendId, sendId)
               .eq(ChatMessage::getReceiveId, receiveId)
               .eq(ChatMessage::getIsRead, 0);
        
        List<ChatMessage> messages = this.list(wrapper);
        for (ChatMessage msg : messages) {
            msg.setIsRead(1);
            this.updateById(msg);
        }
    }

    @Override
    public void markAsReadByConversation(String tenantId, String landlordId, String houseId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getTenantId, tenantId)
               .eq(ChatMessage::getLandlordId, landlordId)
               .eq(ChatMessage::getHouseId, houseId)
               .eq(ChatMessage::getIsRead, 0);
        
        List<ChatMessage> messages = this.list(wrapper);
        for (ChatMessage msg : messages) {
            msg.setIsRead(1);
            this.updateById(msg);
        }
    }

    @Override
    public int getUnreadCount(String receiveId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getReceiveId, receiveId).eq(ChatMessage::getIsRead, 0);
        return (int) this.count(wrapper);
    }

    @Override
    public List<ChatMessage> getConversationList(String userId) {
        System.out.println("ChatMessageServiceImpl.getConversationList - userId: " + userId);
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getSendId, userId).or().eq(ChatMessage::getReceiveId, userId);
        wrapper.orderByDesc(ChatMessage::getCreateTime);
        
        List<ChatMessage> allMessages = this.list(wrapper);
        System.out.println("ChatMessageServiceImpl.getConversationList - 查询到 " + allMessages.size() + " 条消息");
        
        Map<String, ChatMessage> conversationMap = new LinkedHashMap<>();
        for (ChatMessage msg : allMessages) {
            try {
                String sendId = msg.getSendId();
                String receiveId = msg.getReceiveId();
                
                if (sendId == null || receiveId == null) {
                    continue;
                }
                
                String peerId = sendId.equals(userId) ? receiveId : sendId;
                String houseId = msg.getHouseId() != null ? msg.getHouseId() : "";
                String key = !houseId.isEmpty() ? peerId + "_" + houseId : peerId;
                System.out.println("处理消息 - sendId: " + sendId + ", receiveId: " + receiveId + ", peerId: " + peerId + ", houseId: " + houseId + ", key: " + key);
                if (!conversationMap.containsKey(key)) {
                    conversationMap.put(key, msg);
                    System.out.println("添加会话: " + key);
                } else {
                    System.out.println("会话已存在: " + key);
                }
            } catch (Exception e) {
                System.err.println("处理消息会话失败: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("ChatMessageServiceImpl.getConversationList - 返回 " + conversationMap.size() + " 条会话");
        return new ArrayList<>(conversationMap.values());
    }

    @Override
    public boolean deleteMessagesByConversation(String tenantId, String landlordId, String houseId) {
        System.out.println("删除消息 - tenantId: " + tenantId + ", landlordId: " + landlordId + ", houseId: " + houseId);
        
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        
        // 构建查询条件，只删除特定会话的消息
        if (tenantId != null && !tenantId.isEmpty()) {
            wrapper.eq(ChatMessage::getTenantId, tenantId);
        }
        if (landlordId != null && !landlordId.isEmpty()) {
            wrapper.eq(ChatMessage::getLandlordId, landlordId);
        }
        if (houseId != null && !houseId.isEmpty()) {
            wrapper.eq(ChatMessage::getHouseId, houseId);
        }
        
        // 先查询符合条件的消息数量
        long count = this.count(wrapper);
        System.out.println("符合条件的消息数量: " + count);
        
        if (count == 0) {
            // 如果没有符合条件的消息，直接返回成功
            System.out.println("没有符合条件的消息，返回成功");
            return true;
        }
        
        boolean success = this.remove(wrapper);
        System.out.println("删除结果: " + success);
        
        return success;
    }
}

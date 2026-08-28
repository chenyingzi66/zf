package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.ChatMessage;

import java.util.List;

public interface ChatMessageService extends IService<ChatMessage> {
    boolean sendMessage(String sendId, String receiveId, String content);
    boolean sendMessage(String sendId, String receiveId, String content, String tenantId, String landlordId, String houseId);
    List<ChatMessage> getChatHistory(String sendId, String receiveId);
    List<ChatMessage> getChatHistoryByConversation(String tenantId, String landlordId, String houseId);
    void markAsRead(String sendId, String receiveId);
    void markAsReadByConversation(String tenantId, String landlordId, String houseId);
    int getUnreadCount(String receiveId);
    List<ChatMessage> getConversationList(String userId);
    boolean deleteMessagesByConversation(String tenantId, String landlordId, String houseId);
}

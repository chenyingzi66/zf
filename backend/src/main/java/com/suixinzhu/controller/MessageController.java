package com.suixinzhu.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.entity.ChatMessage;
import com.suixinzhu.entity.House;
import com.suixinzhu.entity.SysHost;
import com.suixinzhu.entity.SysUser;
import com.suixinzhu.mapper.SysHostMapper;
import com.suixinzhu.mapper.SysUserMapper;
import com.suixinzhu.service.ChatMessageService;
import com.suixinzhu.service.HouseService;
import com.suixinzhu.websocket.WebSocketServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/message")
public class MessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysHostMapper sysHostMapper;

    @Autowired
    private HouseService houseService;

    @PostMapping("/send")
    public Result<Boolean> sendMessage(@RequestBody Map<String, Object> params) {
        String sendId = (String) params.get("sendId");
        String receiveId = (String) params.get("receiveId");
        String content = (String) params.get("content");
        String tenantId = (String) params.get("tenantId");
        String landlordId = (String) params.get("landlordId");
        String houseId = (String) params.get("houseId");

        if (sendId == null || sendId.isEmpty()) {
            return Result.error("发送方ID不能为空");
        }
        if (receiveId == null || receiveId.isEmpty()) {
            return Result.error("接收方ID不能为空");
        }
        if (content == null || content.trim().isEmpty()) {
            return Result.error("消息内容不能为空");
        }

        boolean success = chatMessageService.sendMessage(sendId, receiveId, content.trim(), tenantId, landlordId, houseId);
        return success ? Result.success(true) : Result.error("发送失败");
    }

    @GetMapping("/history/{peerId}")
    public Result<List<Map<String, Object>>> getChatHistory(
            @RequestParam String userId,
            @PathVariable String peerId) {
        if (userId == null || userId.isEmpty()) {
            return Result.error("用户ID不能为空");
        }
        List<ChatMessage> messages = chatMessageService.getChatHistory(userId, peerId);
        chatMessageService.markAsRead(peerId, userId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ChatMessage msg : messages) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("senderId", msg.getSendId());
            map.put("receiveId", msg.getReceiveId());
            map.put("content", msg.getContent());
            map.put("isRead", msg.getIsRead());
            map.put("createTime", msg.getCreateTime());
            map.put("tenantId", msg.getTenantId());
            map.put("landlordId", msg.getLandlordId());
            map.put("houseId", msg.getHouseId());
            result.add(map);
        }
        return Result.success(result);
    }

    @GetMapping("/conversation")
    public Result<List<Map<String, Object>>> getConversationHistory(
            @RequestParam String tenantId,
            @RequestParam String landlordId,
            @RequestParam String houseId) {
        if (tenantId == null || tenantId.isEmpty() || landlordId == null || landlordId.isEmpty() || houseId == null || houseId.isEmpty()) {
            return Result.error("参数不能为空");
        }
        List<ChatMessage> messages = chatMessageService.getChatHistoryByConversation(tenantId, landlordId, houseId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ChatMessage msg : messages) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("senderId", msg.getSendId());
            map.put("receiveId", msg.getReceiveId());
            map.put("content", msg.getContent());
            map.put("isRead", msg.getIsRead());
            map.put("createTime", msg.getCreateTime());
            result.add(map);
        }
        return Result.success(result);
    }

    @GetMapping("/unread")
    public Result<Map<String, Object>> getUnreadCount(@RequestParam String userId) {
        if (userId == null || userId.isEmpty()) {
            return Result.error("用户ID不能为空");
        }
        int count = chatMessageService.getUnreadCount(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("count", count);
        return Result.success(data);
    }

    @GetMapping("/conversations")
    public Result<List<Map<String, Object>>> getConversationList(@RequestParam String userId) {
        if (userId == null || userId.isEmpty()) {
            return Result.error("用户ID不能为空");
        }
        List<ChatMessage> conversations = chatMessageService.getConversationList(userId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ChatMessage msg : conversations) {
            Map<String, Object> map = new HashMap<>();
            String peerId = msg.getSendId().equals(userId) ? msg.getReceiveId() : msg.getSendId();
            
            LambdaQueryWrapper<SysUser> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.eq(SysUser::getUserId, peerId);
            SysUser user = sysUserMapper.selectOne(userWrapper);
            
            LambdaQueryWrapper<SysHost> hostWrapper = new LambdaQueryWrapper<>();
            hostWrapper.eq(SysHost::getHostId, peerId);
            SysHost host = sysHostMapper.selectOne(hostWrapper);
            
            map.put("conversationId", "conv_" + msg.getTenantId() + "_" + msg.getLandlordId() + "_" + msg.getHouseId());
            map.put("peerId", peerId);
            map.put("peerName", user != null ? user.getNickname() : (host != null ? host.getName() : "用户"));
            map.put("peerAvatar", user != null ? user.getAvatar() : (host != null ? host.getAvatar() : ""));
            map.put("houseId", msg.getHouseId());
            // 获取房源标题
            String houseTitle = "";
            if (msg.getHouseId() != null && !msg.getHouseId().isEmpty()) {
                House house = houseService.getByHouseId(msg.getHouseId());
                if (house != null) {
                    houseTitle = house.getTitle();
                }
            }
            map.put("houseTitle", houseTitle);
            map.put("lastMsg", msg.getContent());
            map.put("lastTime", msg.getCreateTime());
            map.put("tenantId", msg.getTenantId()); 
            map.put("landlordId", msg.getLandlordId());
            
            // 计算该会话的未读消息数
            LambdaQueryWrapper<ChatMessage> unreadWrapper = new LambdaQueryWrapper<>();
            unreadWrapper.eq(ChatMessage::getTenantId, msg.getTenantId())
                        .eq(ChatMessage::getLandlordId, msg.getLandlordId())
                        .eq(ChatMessage::getHouseId, msg.getHouseId())
                        .eq(ChatMessage::getSendId, peerId)
                        .eq(ChatMessage::getReceiveId, userId)
                        .eq(ChatMessage::getIsRead, 0);
            int unreadCount = (int) chatMessageService.count(unreadWrapper);
            map.put("unreadCount", unreadCount);
            
            result.add(map);
        }
        
        result.sort((a, b) -> {
            if (a.get("lastTime") == null) return 1;
            if (b.get("lastTime") == null) return -1;
            return b.get("lastTime").toString().compareTo(a.get("lastTime").toString());
        });
        
        return Result.success(result);
    }

    @PostMapping("/read")
    public Result<Boolean> markAsRead(@RequestBody Map<String, Object> params) {
        String userId = (String) params.get("userId");
        String peerId = (String) params.get("peerId");
        String tenantId = (String) params.get("tenantId");
        String landlordId = (String) params.get("landlordId");
        String houseId = (String) params.get("houseId");

        if (userId == null || userId.isEmpty()) {
            return Result.error("用户ID不能为空");
        }
        if (peerId == null || peerId.isEmpty()) {
            return Result.error("对方ID不能为空");
        }

        if (tenantId != null && landlordId != null && houseId != null) {
            // 如果有会话信息，只标记该会话的消息为已读
            chatMessageService.markAsReadByConversation(tenantId, landlordId, houseId);
        } else {
            // 否则标记所有来自该用户的消息为已读
            chatMessageService.markAsRead(peerId, userId);
        }
        return Result.success(true);
    }

    @PostMapping("/delete")
    public Result<Boolean> deleteMessages(@RequestBody Map<String, Object> params) {
        String tenantId = (String) params.get("tenantId");
        String landlordId = (String) params.get("landlordId");
        String houseId = (String) params.get("houseId");
        String conversationId = (String) params.get("conversationId");

        System.out.println("删除消息请求 - tenantId: " + tenantId + ", landlordId: " + landlordId + ", houseId: " + houseId + ", conversationId: " + conversationId);

        if (tenantId == null || tenantId.isEmpty()) {
            return Result.error("租户ID不能为空");
        }
        if (landlordId == null || landlordId.isEmpty()) {
            return Result.error("房东ID不能为空");
        }

        boolean success = chatMessageService.deleteMessagesByConversation(tenantId, landlordId, houseId);
        return success ? Result.success(true) : Result.error("删除失败");
    }
}

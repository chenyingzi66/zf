package com.suixinzhu.websocket;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 服务端点
 * 用于实现聊天消息和系统通知的实时推送
 */
@ServerEndpoint("/ws/{userId}")
@Component
public class WebSocketServer {

    // 存放每个客户端对应的Session对象
    private static final ConcurrentHashMap<String, Session> sessionMap = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        sessionMap.put(userId, session);
        System.out.println("WebSocket connected: " + userId + ", current active: " + sessionMap.size());
    }

    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        sessionMap.remove(userId);
        System.out.println("WebSocket disconnected: " + userId + ", current active: " + sessionMap.size());
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("userId") String userId) {
        System.out.println("Received WebSocket message from " + userId + ": " + message);
        // 本系统主要是通过 REST API 发送消息并落库，WebSocket 主要用于服务器主动推送，前端也可以发心跳
        if ("PING".equals(message)) {
            try {
                session.getBasicRemote().sendText("PONG");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.err.println("WebSocket error: " + error.getMessage());
    }

    /**
     * 服务器主动推送消息给指定用户
     */
    public static void sendMessage(String userId, String message) {
        Session session = sessionMap.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

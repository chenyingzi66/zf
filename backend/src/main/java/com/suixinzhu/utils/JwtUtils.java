package com.suixinzhu.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JWT 工具类
 * 技术栈：JDK17 + SpringBoot3.2.3 + Tomcat10.1（jakarta命名空间）
 */
@Component
public class JwtUtils {

    @Value("${suixinzhu.jwt.secret}")
    private String secret;

    @Value("${suixinzhu.jwt.expire}")
    private Long expire;

    /**
     * 生成 JWT token
     */
    public String generateToken(Map<String, Object> claims) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expire * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 生成 JWT token（简易版本）
     */
    public String generateToken(String userId, String role) {
        return generateToken(Map.of("userId", userId, "role", role));
    }

    /**
     * 从 token 获取用户ID（String版本）
     */
    public String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Claims claims = parseToken(token);
        return claims.get("userId").toString();
    }

    /**
     * 解析 JWT token
     */
    public Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 判断 token 是否过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * 从 token 获取用户ID
     */
    public String getUserId(String token) {
        Claims claims = parseToken(token);
        return claims.get("userId").toString();
    }

    /**
     * 从 token 获取用户角色
     */
    public String getUserRole(String token) {
        Claims claims = parseToken(token);
        return (String) claims.get("role");
    }

    /**
     * 从 HttpServletRequest 中获取用户ID（由 AuthInterceptor 预先解析注入）
     */
    public static String getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("未登录或Token无效");
        }
        return userId.toString();
    }

    /**
     * 从 HttpServletRequest 中获取用户角色
     */
    public static String getRoleFromRequest(HttpServletRequest request) {
        Object role = request.getAttribute("role");
        if (role == null) {
            throw new RuntimeException("未登录或Token无效");
        }
        return role.toString();
    }
}

package com.suixinzhu.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suixinzhu.common.Result;
import com.suixinzhu.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isBlank()) {
            write(response, Result.unauthorized("请先登录"));
            return false;
        }
        try {
            if (jwtUtils.isTokenExpired(token)) {
                write(response, Result.unauthorized("登录已过期，请重新登录"));
                return false;
            }
            Claims claims = jwtUtils.parseToken(token);
            request.setAttribute("userId", claims.get("userId").toString());
            request.setAttribute("role", claims.get("role").toString());
            return true;
        } catch (Exception e) {
            write(response, Result.unauthorized("Token 无效"));
            return false;
        }
    }

    private void write(HttpServletResponse response, Result<?> result) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(200);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}

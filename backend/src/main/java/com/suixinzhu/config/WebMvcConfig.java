package com.suixinzhu.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Value("${upload.path:C:/Users/16026/Desktop/suixin/uploads/}")
    private String uploadPath;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/user/login",
                        "/user/register",
                        "/user/sms",
                        "/host/login",
                        "/host/register",
                        "/host/sms",
                        "/admin/login",
                        "/admin/**",
                        "/banner/list",
                        "/banner/all",
                        "/banner/add",
                        "/banner/delete/**",
                        "/banner/update",
                        "/house/list",
                        "/house/all",
                        "/house/active",
                        "/house/detail/**",
                        "/house/audit",
                        "/house/update",
                        "/house/delete/**",
                        "/feedback/list",
                        "/feedback/process",
                        "/feedback/delete",
                        "/order/detail/**",
                        "/order/delete/**",
                        "/message/**",
                        "/upload/**",
                        "/ws/**",
                        "/uploads/**",
                        "/error"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}

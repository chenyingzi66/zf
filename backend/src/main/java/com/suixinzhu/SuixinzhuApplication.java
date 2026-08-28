package com.suixinzhu;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.suixinzhu.mapper")
@EnableScheduling
public class SuixinzhuApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(SuixinzhuApplication.class);
        // app.addInitializers(new BeanDefinitionInspector()); // 注释掉，避免重复注册
        app.run(args);
        System.out.println("=== 随心住后端服务启动成功 http://localhost:8080 ===");
    }
}

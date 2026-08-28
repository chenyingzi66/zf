package com.suixinzhu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.lang.NonNull;

import java.util.Arrays;

/**
 * 用于在应用启动早期检查 BeanDefinition 中是否存在不合法的属性值（如 factoryBeanObjectType 为 String）。
 */
public class BeanDefinitionInspector implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(BeanDefinitionInspector.class);

    @Override
    @SuppressWarnings("null")
    public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
        String[] names = applicationContext.getBeanFactory().getBeanDefinitionNames();
        Arrays.sort(names);
        for (String name : names) {
            BeanDefinition bd = applicationContext.getBeanFactory().getBeanDefinition(name);
            Object attr = bd.getAttribute("factoryBeanObjectType");
            if (attr != null && attr instanceof String) {
                String message = String.format("BeanDefinition '%s' has factoryBeanObjectType attribute of type String (value=%s).", name, attr);
                System.err.println(message);
                log.warn(message);
            }
        }
    }
}

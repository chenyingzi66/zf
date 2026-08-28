package com.suixinzhu.scheduler;

import com.suixinzhu.service.HouseOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderScheduler.class);

    @Autowired
    private HouseOrderService houseOrderService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void autoCompleteExpiredOrders() {
        log.info("开始执行订单自动完结定时任务...");
        try {
            int count = houseOrderService.autoCompleteExpiredOrders();
            log.info("订单自动完结定时任务执行完成，共完结 {} 个订单", count);
        } catch (Exception e) {
            log.error("订单自动完结定时任务执行异常: {}", e.getMessage(), e);
        }
    }
}

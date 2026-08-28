package com.suixinzhu.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.suixinzhu.entity.Feedback;
import com.suixinzhu.mapper.FeedbackMapper;
import com.suixinzhu.service.FeedbackService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackServiceImpl extends ServiceImpl<FeedbackMapper, Feedback> implements FeedbackService {

    @Override
    public boolean submitFeedback(String userId, String userType, String type, String content) {
        Feedback feedback = new Feedback();
        feedback.setUserId(userId);
        feedback.setUserType(userType != null ? userType : "user");
        feedback.setType(type);
        feedback.setContent(content);
        feedback.setStatus(0);
        feedback.setReply("");
        feedback.setCreateTime(LocalDateTime.now());
        feedback.setUpdateTime(LocalDateTime.now());
        return this.save(feedback);
    }

    @Override
    public boolean processFeedback(Long id, String reply) {
        Feedback feedback = this.getById(id);
        if (feedback == null) {
            return false;
        }
        feedback.setStatus(1);
        feedback.setReply(reply != null ? reply : "");
        feedback.setUpdateTime(LocalDateTime.now());
        return this.updateById(feedback);
    }

    @Override
    public boolean deleteFeedback(Long id) {
        Feedback feedback = this.getById(id);
        if (feedback == null) {
            return false;
        }
        return this.removeById(id);
    }

    @Override
    public List<Feedback> getFeedbackByUserId(String userId) {
        LambdaQueryWrapper<Feedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Feedback::getUserId, userId).orderByDesc(Feedback::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public List<Feedback> getAllFeedback() {
        LambdaQueryWrapper<Feedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Feedback::getCreateTime);
        return this.list(wrapper);
    }
}

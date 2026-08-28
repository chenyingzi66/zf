package com.suixinzhu.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.suixinzhu.entity.Feedback;

import java.util.List;

public interface FeedbackService extends IService<Feedback> {
    boolean submitFeedback(String userId, String userType, String type, String content);
    boolean processFeedback(Long id, String reply);
    boolean deleteFeedback(Long id);
    List<Feedback> getFeedbackByUserId(String userId);
    List<Feedback> getAllFeedback();
}

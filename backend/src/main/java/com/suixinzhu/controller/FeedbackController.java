package com.suixinzhu.controller;

import com.suixinzhu.common.Result;
import com.suixinzhu.entity.Feedback;
import com.suixinzhu.service.FeedbackService;
import com.suixinzhu.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/submit")
    public Result<Boolean> submitFeedback(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> params) {
        String userId = jwtUtils.getUserIdFromToken(token);
        String userType = params.get("userType");
        String type = params.get("type");
        String content = params.get("content");

        if (type == null || type.isEmpty()) {
            return Result.error("反馈类型不能为空");
        }
        if (content == null || content.isEmpty()) {
            return Result.error("反馈内容不能为空");
        }

        boolean success = feedbackService.submitFeedback(userId, userType, type, content);
        return success ? Result.success(true) : Result.error("提交失败");
    }

    @GetMapping("/list")
    public Result<List<Feedback>> getUserFeedback(@RequestHeader("Authorization") String token) {
        String userId = jwtUtils.getUserIdFromToken(token);
        List<Feedback> list = feedbackService.getFeedbackByUserId(userId);
        return Result.success(list);
    }

    @GetMapping("/all")
    public Result<List<Feedback>> getAllFeedback() {
        List<Feedback> list = feedbackService.getAllFeedback();
        return Result.success(list);
    }

    @PostMapping("/process")
    public Result<Boolean> processFeedback(@RequestBody Map<String, Object> params) {
        Long id = params.get("id") != null ? Long.valueOf(params.get("id").toString()) : null;
        String reply = (String) params.get("reply");

        if (id == null) {
            return Result.error("ID不能为空");
        }

        boolean success = feedbackService.processFeedback(id, reply);
        return success ? Result.success(true) : Result.error("处理失败");
    }

    @PostMapping("/delete")
    public Result<Boolean> deleteFeedback(@RequestBody Map<String, Object> params) {
        Long id = params.get("id") != null ? Long.valueOf(params.get("id").toString()) : null;

        if (id == null) {
            return Result.error("ID不能为空");
        }

        boolean success = feedbackService.deleteFeedback(id);
        return success ? Result.success(true) : Result.error("删除失败");
    }
}

// pages/landlord/feedback/feedback.js
const { submitFeedback } = require('../../../utils/api.js');

const TYPES = ['功能问题', '房源问题', '服务投诉', '其他'];

Page({
  data: { types: TYPES, activeType: 0, content: '', submitting: false },

  selectType(e) { this.setData({ activeType: e.currentTarget.dataset.idx }); },
  onInput(e) { this.setData({ content: e.detail.value }); },

  submit() {
    if (this.data.submitting) return;
    if (!this.data.content || !this.data.content.trim()) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' }); 
      this.setData({ contentErr: true });
      return;
    }
    if (this.data.content.trim().length < 10) {
      wx.showToast({ title: '反馈内容至少10个字符', icon: 'none' }); 
      this.setData({ contentErr: true });
      return;
    }
    this.setData({ submitting: true, contentErr: false });
    
    submitFeedback({
      type: TYPES[this.data.activeType],
      content: this.data.content.trim()
    }).then(() => {
      this.setData({ submitting: false, content: '' });
      wx.showModal({ title: '提交成功', content: '感谢您的反馈，我们将尽快处理！', showCancel: false, success: () => wx.navigateBack() });
    }).catch(() => this.setData({ submitting: false }));
  }
});

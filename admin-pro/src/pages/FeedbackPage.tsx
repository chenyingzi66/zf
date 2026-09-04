/**
 * 反馈管理。1:1 复刻旧界面 index.html:482-519 + admin.js:338-365。
 * 「处理」没有二次确认,且回复内容硬编码「已处理」;已处理时按钮禁用。
 */
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { useConfirm } from '../components/ConfirmDialog';
import { useApiResource } from '../hooks/useApiResource';
import { toast } from '../lib/localizedToast';
import { feedbackStatusMeta, StatusBadge } from '../lib/enums';
import { formatDateTime } from '../lib/format';
import { deleteFeedback, listFeedbacks, processFeedback, type Feedback } from '../api';

export default function FeedbackPage() {
  const resource = useApiResource(listFeedbacks);
  const { confirm, confirmNode } = useConfirm();
  const feedbacks = resource.data ?? [];

  const process = async (feedback: Feedback) => {
    try {
      await processFeedback(feedback.id);
      toast.success('已处理');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '处理失败');
    }
  };

  const remove = async (feedback: Feedback) => {
    const confirmed = await confirm({ description: '确定删除该反馈?此操作不可恢复!' });
    if (!confirmed) return;
    try {
      await deleteFeedback(feedback.id);
      toast.success('删除成功');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns: Column<Feedback>[] = [
    { key: 'userId', title: '用户ID', render: feedback => feedback.userId },
    { key: 'type', title: '类型', render: feedback => feedback.type },
    {
      key: 'content',
      title: '内容',
      render: feedback => <span className="break-all">{feedback.content}</span>,
    },
    { key: 'status', title: '状态', render: feedback => <StatusBadge meta={feedbackStatusMeta(feedback.status)} /> },
    { key: 'createTime', title: '创建时间', render: feedback => formatDateTime(feedback.createTime) },
    {
      key: 'actions',
      title: '操作',
      width: 130,
      render: feedback => (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => void process(feedback)} disabled={feedback.status === 1}>处理</Button>
          <Button variant="destructive" size="sm" onClick={() => void remove(feedback)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="反馈管理" description="小程序端提交的意见反馈" />
      <DataTable
        title="反馈列表"
        columns={columns}
        rows={feedbacks}
        rowKey={feedback => feedback.id}
        loading={resource.loading}
        error={resource.error}
      />
      {confirmNode}
    </AdminLayout>
  );
}

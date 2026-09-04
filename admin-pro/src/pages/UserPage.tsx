/**
 * 用户管理。1:1 复刻旧界面 index.html:297-334 + admin.js:215-225,260-271。
 * 表格/按钮/头像全部用模版组件(ui/table、ui/button、ui/avatar)。
 * 注意 /admin/user/list 会返回 MD5 密码字段,这里绝不渲染。
 */
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { useConfirm } from '../components/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { useApiResource } from '../hooks/useApiResource';
import { usePendingCounts } from '../hooks/usePendingCounts';
import { toast } from '../lib/localizedToast';
import { formatDateTime, normalizeImageUrl } from '../lib/format';
import { deleteUser, listUsers, type SysUser } from '../api';

export default function UserPage() {
  const resource = useApiResource(listUsers);
  const { refresh } = usePendingCounts();
  const { confirm, confirmNode } = useConfirm();
  const users = resource.data ?? [];

  const removeUser = async (user: SysUser) => {
    const confirmed = await confirm({ description: '确定删除该用户?此操作不可恢复!' });
    if (!confirmed) return;
    try {
      await deleteUser(user.userId);
      toast.success('删除成功');
      void resource.reload();
      void refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns: Column<SysUser>[] = [
    {
      key: 'avatar',
      title: '头像',
      width: 80,
      align: 'center',
      render: user => (
        <Avatar className="mx-auto size-9">
          {user.avatar && (
            <AvatarImage src={normalizeImageUrl(user.avatar)} alt={`${user.nickname || '用户'}的头像`} />
          )}
          <AvatarFallback>{(user.nickname || 'U').charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'userId', title: '用户ID', render: user => user.userId },
    { key: 'nickname', title: '昵称', render: user => user.nickname },
    { key: 'phone', title: '手机号', render: user => user.phone },
    { key: 'createTime', title: '注册时间', render: user => formatDateTime(user.createTime) },
    {
      key: 'actions',
      title: '操作',
      width: 100,
      render: user => (
        <Button variant="destructive" size="sm" onClick={() => void removeUser(user)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="用户管理" description="小程序端注册的租客账号" />
      <DataTable
        title="用户列表"
        columns={columns}
        rows={users}
        rowKey={user => user.id}
        loading={resource.loading}
        error={resource.error}
      />
      {confirmNode}
    </AdminLayout>
  );
}

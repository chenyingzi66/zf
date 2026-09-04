/**
 * 房东管理。1:1 复刻旧界面 index.html:337-377 + admin.js:227-258。
 * 「认证通过」发 certStatus=2、「取消认证」发 certStatus=3(字典含义是已拒绝),按旧行为保留。
 * 同样返回 MD5 密码字段,不渲染。
 */
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { useConfirm } from '../components/ConfirmDialog';
import { useApiResource } from '../hooks/useApiResource';
import { toast } from '../lib/localizedToast';
import { certStatusMeta, StatusBadge } from '../lib/enums';
import { formatDateTime } from '../lib/format';
import { auditHost, deleteHost, listHosts, type SysHost } from '../api';

export default function HostPage() {
  const resource = useApiResource(listHosts);
  const { confirm, confirmNode } = useConfirm();
  const hosts = resource.data ?? [];

  const changeCert = async (host: SysHost, certStatus: number) => {
    const action = certStatus === 2 ? '通过认证' : '取消认证';
    const confirmed = await confirm({ title: '提示', description: `确定${action}该房东?`, tone: 'default' });
    if (!confirmed) return;
    try {
      await auditHost(host.hostId, certStatus);
      toast.success('操作成功');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const removeHost = async (host: SysHost) => {
    const confirmed = await confirm({ description: '确定删除该房东?此操作不可恢复!' });
    if (!confirmed) return;
    try {
      await deleteHost(host.hostId);
      toast.success('删除成功');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns: Column<SysHost>[] = [
    { key: 'hostId', title: '房东ID', render: host => host.hostId },
    { key: 'name', title: '名称', render: host => host.name },
    { key: 'phone', title: '手机号', render: host => host.phone },
    { key: 'realName', title: '真实姓名', render: host => host.realName || '-' },
    {
      key: 'certStatus',
      title: '认证状态',
      render: host => <StatusBadge meta={certStatusMeta(host.certStatus)} />,
    },
    { key: 'createTime', title: '注册时间', render: host => formatDateTime(host.createTime) },
    {
      key: 'actions',
      title: '操作',
      width: 190,
      render: host => (
        <div className="flex items-center gap-2">
          {host.certStatus !== 2 && (
            <Button size="sm" onClick={() => void changeCert(host, 2)}>认证通过</Button>
          )}
          {host.certStatus === 2 && (
            <Button variant="outline" size="sm" onClick={() => void changeCert(host, 3)}>取消认证</Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => void removeHost(host)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="房东管理" description="房东账号与实名认证状态" />
      <DataTable
        title="房东列表"
        columns={columns}
        rows={hosts}
        rowKey={host => host.id}
        loading={resource.loading}
        error={resource.error}
      />
      {confirmNode}
    </AdminLayout>
  );
}

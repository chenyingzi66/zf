/**
 * 订单管理。1:1 复刻旧界面 index.html:439-479 + admin.js:314-336。
 * 订单状态 1(已确认)/2(租住中)时不发删除请求,直接提示,和旧行为一致。
 */
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { useConfirm } from '../components/ConfirmDialog';
import { useApiResource } from '../hooks/useApiResource';
import { usePendingCounts } from '../hooks/usePendingCounts';
import { toast } from '../lib/localizedToast';
import { orderStatusMeta, StatusBadge } from '../lib/enums';
import { formatDateTime, formatMoney } from '../lib/format';
import { deleteOrder, listOrders, type HouseOrder } from '../api';

export default function OrderPage() {
  const resource = useApiResource(listOrders);
  const { refresh } = usePendingCounts();
  const { confirm, confirmNode } = useConfirm();
  const orders = resource.data ?? [];

  const removeOrder = async (order: HouseOrder) => {
    if (order.orderStatus === 1 || order.orderStatus === 2) {
      toast.warning('租住中的订单无法删除,请先完结订单');
      return;
    }
    const confirmed = await confirm({ description: '确定删除该订单?此操作不可恢复!' });
    if (!confirmed) return;
    try {
      await deleteOrder(order.orderNo);
      toast.success('删除成功');
      void resource.reload();
      void refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns: Column<HouseOrder>[] = [
    { key: 'orderNo', title: '订单号', render: order => order.orderNo },
    { key: 'houseTitle', title: '房源标题', render: order => order.houseTitle || '-' },
    {
      key: 'totalAmount',
      title: '金额',
      render: order => <span className="text-destructive font-semibold">{formatMoney(order.totalAmount)}</span>,
    },
    { key: 'orderStatus', title: '状态', render: order => <StatusBadge meta={orderStatusMeta(order.orderStatus)} /> },
    { key: 'userId', title: '用户ID', render: order => order.userId },
    { key: 'hostId', title: '房东ID', render: order => order.hostId },
    { key: 'createTime', title: '创建时间', render: order => formatDateTime(order.createTime) },
    {
      key: 'actions',
      title: '操作',
      width: 90,
      render: order => (
        <Button variant="destructive" size="sm" onClick={() => void removeOrder(order)}>删除</Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="订单管理" description="全部租订单据与状态" />
      <DataTable
        title="订单列表"
        columns={columns}
        rows={orders}
        rowKey={order => order.id}
        loading={resource.loading}
        error={resource.error}
      />
      {confirmNode}
    </AdminLayout>
  );
}

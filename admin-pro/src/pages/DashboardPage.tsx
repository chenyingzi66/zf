/**
 * 数据概览。1:1 复刻旧界面 index.html:230-294 + admin.js:195-213:
 * 并发拉 /admin/stat、/house/all、/admin/order/list,四张统计卡 + 两张待办卡(各取前 5 条)。
 */
import { useState } from 'react';
import { ClipboardListIcon, HomeIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import HouseAuditDialog from '../components/HouseAuditDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import { usePendingCounts } from '../hooks/usePendingCounts';
import { getStat, listAllHouses, listOrders, type House } from '../api';
import { formatDateTime } from '../lib/format';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { refresh } = usePendingCounts();
  const [auditTarget, setAuditTarget] = useState<House | null>(null);

  const resource = useApiResource(async () => {
    const [stat, houses, orders] = await Promise.all([getStat(), listAllHouses(), listOrders()]);
    return { stat, houses, orders };
  });

  const stat = resource.data?.stat;
  const pendingHouses = (resource.data?.houses ?? []).filter(house => house.auditStatus === 0);
  const pendingOrders = (resource.data?.orders ?? []).filter(order => order.orderStatus === 0);

  const reloadAll = () => {
    void resource.reload();
    void refresh();
  };

  const cards = [
    { label: '用户总数', value: stat?.userCount ?? 0, icon: <UsersIcon size={18} />, color: 'var(--primary)' },
    { label: '房东总数', value: stat?.hostCount ?? 0, icon: <ShieldCheckIcon size={18} />, color: '#22c55e' },
    { label: '房源总数', value: stat?.houseCount ?? 0, icon: <HomeIcon size={18} />, color: '#f59e0b' },
    { label: '订单总数', value: stat?.orderCount ?? 0, icon: <ClipboardListIcon size={18} />, color: '#8b5cf6' },
  ];

  return (
    <AdminLayout>
      <PageHeader title="数据概览" description="随心住平台整体运营情况" />

      {(resource.loading || resource.error) && (
        <Card className="py-0">
          <ApiState loading={resource.loading} error={resource.error} />
        </Card>
      )}

      {!resource.loading && !resource.error && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(card => (
              <Card key={card.label} className="gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">{card.label}</span>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <div className="font-bold">{card.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="gap-0 overflow-hidden py-0">
              <CardHeader className="flex items-center justify-between border-b px-5 py-4">
                <span className="font-semibold">待审核房源</span>
                <Button variant="link" onClick={() => navigate('/houses')}>查看全部</Button>
              </CardHeader>
              <CardContent className="px-5 py-2">
                {pendingHouses.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center">暂无待审核房源</div>
                ) : (
                  pendingHouses.slice(0, 5).map(house => (
                    <div
                      key={house.houseId}
                      className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{house.title}</div>
                        <div className="text-muted-foreground mt-1 truncate">
                          {house.city} · {house.hostId}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setAuditTarget(house)}>审核</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden py-0">
              <CardHeader className="flex items-center justify-between border-b px-5 py-4">
                <span className="font-semibold">待处理订单</span>
                <Button variant="link" onClick={() => navigate('/orders')}>查看全部</Button>
              </CardHeader>
              <CardContent className="px-5 py-2">
                {pendingOrders.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center">暂无待处理订单</div>
                ) : (
                  pendingOrders.slice(0, 5).map(order => (
                    <div key={order.orderNo} className="border-b py-3 last:border-b-0">
                      <div className="font-medium">{order.orderNo}</div>
                      <div className="text-muted-foreground mt-1">{formatDateTime(order.createTime)}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <HouseAuditDialog
        open={auditTarget !== null}
        house={auditTarget}
        onOpenChange={open => !open && setAuditTarget(null)}
        onSuccess={reloadAll}
      />
    </AdminLayout>
  );
}

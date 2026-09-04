/**
 * 房源管理。1:1 复刻旧界面 index.html:380-436 + admin.js:273-312,367-378。
 * 列表取 /house/all(不是 /admin/house/list);筛选全在前端内存里做:
 * 审核状态全等匹配,城市与房东ID 用 includes 模糊匹配。
 */
import { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useConfirm } from '../components/ConfirmDialog';
import HouseAuditDialog from '../components/HouseAuditDialog';
import HouseDetailDialog from '../components/HouseDetailDialog';
import { useApiResource } from '../hooks/useApiResource';
import { usePendingCounts } from '../hooks/usePendingCounts';
import { toast } from '../lib/localizedToast';
import { ALL_OPTION_VALUE, AUDIT_STATUS_OPTIONS, auditStatusMeta, houseStatusMeta, StatusBadge } from '../lib/enums';
import { formatMoney } from '../lib/format';
import { deleteHouse, listAllHouses, type House } from '../api';

export default function HousePage() {
  const resource = useApiResource(listAllHouses);
  const { refresh } = usePendingCounts();
  const { confirm, confirmNode } = useConfirm();

  const [auditStatus, setAuditStatus] = useState(ALL_OPTION_VALUE);
  const [city, setCity] = useState('');
  const [hostId, setHostId] = useState('');
  const [detailTarget, setDetailTarget] = useState<House | null>(null);
  const [auditTarget, setAuditTarget] = useState<House | null>(null);

  const houses = resource.data ?? [];

  const filtered = useMemo(
    () =>
      houses.filter(house => {
        if (auditStatus !== ALL_OPTION_VALUE && house.auditStatus !== Number(auditStatus)) return false;
        if (city && !(house.city ?? '').includes(city)) return false;
        if (hostId && !String(house.hostId ?? '').includes(hostId)) return false;
        return true;
      }),
    [houses, auditStatus, city, hostId],
  );

  const reloadAll = () => {
    void resource.reload();
    void refresh();
  };

  const removeHouse = async (house: House) => {
    const confirmed = await confirm({ description: '确定删除该房源?此操作不可恢复!' });
    if (!confirmed) return;
    try {
      await deleteHouse(house.houseId);
      toast.success('删除成功');
      reloadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const columns: Column<House>[] = [
    { key: 'houseId', title: '房源ID', render: house => house.houseId },
    { key: 'title', title: '标题', render: house => house.title },
    {
      key: 'price',
      title: '租金',
      render: house => <span className="text-destructive font-semibold">{formatMoney(house.price)}</span>,
    },
    { key: 'city', title: '城市', render: house => house.city || '-' },
    { key: 'auditStatus', title: '审核状态', render: house => <StatusBadge meta={auditStatusMeta(house.auditStatus)} /> },
    { key: 'status', title: '上架状态', render: house => <StatusBadge meta={houseStatusMeta(house.status)} /> },
    { key: 'hostId', title: '房东ID', render: house => house.hostId },
    {
      key: 'actions',
      title: '操作',
      width: 180,
      render: house => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetailTarget(house)}>详情</Button>
          <Button size="sm" onClick={() => setAuditTarget(house)}>审核</Button>
          <Button variant="destructive" size="sm" onClick={() => void removeHouse(house)}>删除</Button>
        </div>
      ),
    },
  ];

  const toolbar = (
    <>
      <Select value={auditStatus} onValueChange={setAuditStatus}>
        <SelectTrigger size="sm" className="w-[132px]">
          <SelectValue placeholder="全部状态" />
        </SelectTrigger>
        <SelectContent>
          {AUDIT_STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input className="h-8 w-[132px]" placeholder="城市" value={city} onChange={event => setCity(event.target.value)} />
      <Input className="h-8 w-[152px]" placeholder="房东ID" value={hostId} onChange={event => setHostId(event.target.value)} />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => { setAuditStatus(ALL_OPTION_VALUE); setCity(''); setHostId(''); }}
      >
        重置
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader title="房源管理" description="房源审核、上下架状态与明细" />
      <DataTable
        title="房源列表"
        columns={columns}
        rows={filtered}
        rowKey={house => house.id}
        toolbar={toolbar}
        loading={resource.loading}
        error={resource.error}
      />

      <HouseDetailDialog
        open={detailTarget !== null}
        house={detailTarget}
        onOpenChange={open => !open && setDetailTarget(null)}
        onAudit={house => setAuditTarget(house)}
      />
      <HouseAuditDialog
        open={auditTarget !== null}
        house={auditTarget}
        onOpenChange={open => !open && setAuditTarget(null)}
        onSuccess={reloadAll}
      />
      {confirmNode}
    </AdminLayout>
  );
}

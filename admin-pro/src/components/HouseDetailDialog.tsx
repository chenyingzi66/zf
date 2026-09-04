/**
 * 房源详情弹窗。1:1 复刻旧界面 index.html:647-718:
 * 纯前端展示,复用列表行数据,不发任何请求(admin.js:303-306),
 * 所以能显示的字段就是 /house/all 返回的字段。
 */
import type { ReactNode } from 'react';
import { auditStatusMeta, houseStatusMeta, StatusBadge } from '../lib/enums';
import { formatMoney } from '../lib/format';
import type { House } from '../api';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface Props {
  open: boolean;
  house: House | null;
  onOpenChange: (open: boolean) => void;
  onAudit: (house: House) => void;
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <div className="text-muted-foreground">{label}</div>
      <div className="break-all">{children}</div>
    </div>
  );
}

export default function HouseDetailDialog({ open, house, onOpenChange, onAudit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>房源详情</DialogTitle>
          <DialogDescription>展示的是列表已有字段,不额外请求详情接口。</DialogDescription>
        </DialogHeader>

        {house && (
          <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-3.5">
              <InfoItem label="房源ID">{house.houseId}</InfoItem>
              <InfoItem label="房源标题">{house.title}</InfoItem>
              <InfoItem label="详细地址">
                {[house.province, house.city, house.district, house.address].filter(Boolean).join(' ') || '-'}
              </InfoItem>
              <InfoItem label="房源信息">
                {`${house.houseType || '-'} · ${house.area ?? '-'}㎡ · ${house.floor || '-'}`}
              </InfoItem>
              <InfoItem label="租赁方式">{house.rentType || '-'}</InfoItem>
              <InfoItem label="配套设施">{house.facilities || '暂无'}</InfoItem>
              <InfoItem label="房源描述">{house.description || '暂无'}</InfoItem>
              <InfoItem label="房东ID">{house.hostId}</InfoItem>
            </div>

            <div className="bg-muted grid gap-3.5 rounded-lg border p-4">
              <div className="grid gap-1">
                <div className="text-muted-foreground">月租金</div>
                <div className="text-destructive font-bold">{formatMoney(house.price)}</div>
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground">审核状态</div>
                <div><StatusBadge meta={auditStatusMeta(house.auditStatus)} /></div>
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground">上架状态</div>
                <div><StatusBadge meta={houseStatusMeta(house.status)} /></div>
              </div>
              <InfoItem label="浏览次数">{`${house.viewCount ?? 0} 次`}</InfoItem>
              {house.auditRemark && <InfoItem label="审核备注">{house.auditRemark}</InfoItem>}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
          {house && house.auditStatus !== 1 && (
            <Button onClick={() => { onOpenChange(false); onAudit(house); }}>审核</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

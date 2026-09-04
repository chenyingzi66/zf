/**
 * 房源审核弹窗。1:1 复刻旧界面 index.html:605-644 + admin.js:287-301。
 * 默认选「审核通过」;备注留空时按结果兜底成「审核通过」/「审核驳回」。
 */
import { useEffect, useState } from 'react';
import { toast } from '../lib/localizedToast';
import { auditHouse, type House } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
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
  onSuccess: () => void;
}

export default function HouseAuditDialog({ open, house, onOpenChange, onSuccess }: Props) {
  const [auditStatus, setAuditStatus] = useState(1);
  const [auditRemark, setAuditRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAuditStatus(1);
      setAuditRemark('');
    }
  }, [open, house?.houseId]);

  const submit = async () => {
    if (!house) return;
    setSubmitting(true);
    try {
      const remark = auditRemark || (auditStatus === 1 ? '审核通过' : '审核驳回');
      await auditHouse(house.houseId, auditStatus, remark);
      toast.success(auditStatus === 1 ? '审核通过,房源已上架' : '已驳回');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '审核失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>房源审核</DialogTitle>
          <DialogDescription>审核结果会直接影响房源在小程序端的可见性。</DialogDescription>
        </DialogHeader>

        <div className="bg-muted text-muted-foreground rounded-lg border px-3 py-2.5 leading-6">
          <div className="text-foreground font-semibold">提示：</div>
          <div>• 审核通过后,房源将自动上架,用户端可见</div>
          <div>• 审核驳回后,房东需要修改信息重新提交</div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="audit-house-id">房源ID</Label>
            <Input id="audit-house-id" value={house?.houseId ?? ''} disabled />
          </div>

          <div className="grid gap-1.5">
            <Label>审核结果</Label>
            <RadioGroup
              className="flex items-center gap-5 pt-1"
              value={String(auditStatus)}
              onValueChange={value => setAuditStatus(Number(value))}
            >
              {[
                { value: 1, label: '审核通过' },
                { value: 2, label: '审核驳回' },
              ].map(option => (
                <div key={option.value} className="flex items-center gap-1.5">
                  <RadioGroupItem id={`audit-status-${option.value}`} value={String(option.value)} />
                  <Label htmlFor={`audit-status-${option.value}`} className="cursor-pointer font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="audit-remark">审核备注</Label>
            <Textarea
              id="audit-remark"
              rows={3}
              value={auditRemark}
              onChange={event => setAuditRemark(event.target.value)}
              placeholder={auditStatus === 1 ? '审核通过' : '请填写驳回原因'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => void submit()} disabled={submitting}>{submitting ? '提交中…' : '确认提交'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

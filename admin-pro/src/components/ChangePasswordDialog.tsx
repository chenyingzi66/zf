/**
 * 修改密码弹窗。1:1 复刻旧界面 index.html:550-572 + admin.js:143-182 的校验顺序与文案。
 * 注意后端只改 JVM 内存里的静态密码字段,重启后会恢复成 123456。
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../lib/localizedToast';
import { changePassword, clearAuth } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [open]);

  const submit = async () => {
    if (!oldPassword) return toast.warning('请输入原密码');
    if (!newPassword) return toast.warning('请输入新密码');
    if (newPassword.length < 6) return toast.warning('新密码长度不能少于6位');
    if (newPassword !== confirmPassword) return toast.warning('两次输入的新密码不一致');
    if (oldPassword === newPassword) return toast.warning('新密码不能与原密码相同');

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('密码修改成功,请重新登录');
      onOpenChange(false);
      window.setTimeout(() => {
        clearAuth();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>修改后当前登录状态会失效,需要重新登录。</DialogDescription>
        </DialogHeader>

        <div className="bg-muted text-muted-foreground rounded-lg border px-3 py-2.5 leading-6">
          <div className="text-foreground font-semibold">密码要求：</div>
          <div>• 新密码长度不能少于6位</div>
          <div>• 新密码不能与原密码相同</div>
          <div>• 修改成功后需要重新登录</div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="old-password">原密码</Label>
            <Input
              id="old-password"
              type="password"
              placeholder="请输入原密码"
              value={oldPassword}
              onChange={event => setOldPassword(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="请输入新密码（至少6位）"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="请再次输入新密码"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && void submit()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => void submit()} disabled={loading}>{loading ? '提交中…' : '确认修改'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

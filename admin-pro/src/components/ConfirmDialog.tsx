/**
 * 二次确认弹窗。复刻旧界面 ElMessageBox.confirm 的交互:
 * 危险操作用红色确认按钮,取消时什么都不做。
 */
import { useCallback, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { buttonVariants } from './ui/button';

export interface ConfirmOptions {
  /** 弹窗标题,旧界面用「提示」或「警告」 */
  title?: string;
  /** 正文,例如「确定删除该用户?此操作不可恢复!」 */
  description: string;
  confirmText?: string;
  cancelText?: string;
  /** danger 用红色确认按钮 */
  tone?: 'danger' | 'default';
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  };

  const isDanger = options?.tone !== 'default';

  const confirmNode = (
    <AlertDialog open={options !== null} onOpenChange={open => !open && settle(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title ?? (isDanger ? '警告' : '提示')}</AlertDialogTitle>
          <AlertDialogDescription>{options?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>{options?.cancelText ?? '取消'}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => settle(true)}
            className={isDanger ? buttonVariants({ variant: 'destructive' }) : undefined}
          >
            {options?.confirmText ?? '确定'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmNode };
}

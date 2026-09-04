/**
 * 状态枚举字典。文案与语义严格对齐旧管理端 admin/js/admin.js:457-495,
 * 展示统一走模版的 Badge 组件(components/ui/badge.tsx),只用 className 区分色调。
 */
import { Badge } from '../components/ui/badge';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONE_CLASS: Record<Tone, string> = {
  primary: 'border-transparent bg-primary/12 text-primary',
  success: 'border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'border-transparent bg-destructive/12 text-destructive',
  info: 'border-transparent bg-muted text-muted-foreground',
};

export interface StatusMeta {
  label: string;
  tone: Tone;
}

const UNKNOWN: StatusMeta = { label: '未知', tone: 'info' };

/** 订单状态 0-5 */
const ORDER_STATUS: Record<number, StatusMeta> = {
  0: { label: '待确认', tone: 'warning' },
  1: { label: '已确认', tone: 'primary' },
  2: { label: '租住中', tone: 'success' },
  3: { label: '已完结', tone: 'info' },
  4: { label: '已取消', tone: 'danger' },
  5: { label: '已拒绝', tone: 'danger' },
};

/** 房源审核状态 0-2 */
const AUDIT_STATUS: Record<number, StatusMeta> = {
  0: { label: '待审核', tone: 'warning' },
  1: { label: '审核通过', tone: 'success' },
  2: { label: '审核驳回', tone: 'danger' },
};

/** 房源上架状态 0-2 */
const HOUSE_STATUS: Record<number, StatusMeta> = {
  0: { label: '未上架', tone: 'info' },
  1: { label: '已上架', tone: 'success' },
  2: { label: '已下架', tone: 'warning' },
};

/** 房东认证状态 0-3 */
const CERT_STATUS: Record<number, StatusMeta> = {
  0: { label: '未认证', tone: 'info' },
  1: { label: '审核中', tone: 'warning' },
  2: { label: '已认证', tone: 'success' },
  3: { label: '已拒绝', tone: 'danger' },
};

export const orderStatusMeta = (status: number): StatusMeta => ORDER_STATUS[status] ?? UNKNOWN;
export const auditStatusMeta = (status: number): StatusMeta => AUDIT_STATUS[status] ?? UNKNOWN;
export const houseStatusMeta = (status: number): StatusMeta => HOUSE_STATUS[status] ?? UNKNOWN;
export const certStatusMeta = (status: number): StatusMeta => CERT_STATUS[status] ?? UNKNOWN;

/** 反馈状态:旧界面是 status===1 ? 已处理 : 未处理 */
export const feedbackStatusMeta = (status: number): StatusMeta =>
  status === 1 ? { label: '已处理', tone: 'success' } : { label: '未处理', tone: 'warning' };

/** 轮播图状态:旧界面是 status===1 ? 启用 : 禁用 */
export const bannerStatusMeta = (status: number): StatusMeta =>
  status === 1 ? { label: '启用', tone: 'success' } : { label: '禁用', tone: 'info' };

/** 房源筛选下拉的选项,与旧界面 index.html:388-391 一致;Radix Select 不接受空值,用 __all__ 兜底 */
export const ALL_OPTION_VALUE = '__all__';

export const AUDIT_STATUS_OPTIONS = [
  { label: '全部状态', value: ALL_OPTION_VALUE },
  { label: '待审核', value: '0' },
  { label: '审核通过', value: '1' },
  { label: '审核驳回', value: '2' },
];

export function StatusBadge({ meta }: { meta: StatusMeta }) {
  return <Badge className={TONE_CLASS[meta.tone]}>{meta.label}</Badge>;
}

import { get, post } from './http';
import type { SysHost } from './types';

/** #8 GET /admin/host/list — 全量返回,响应含 password 字段,不得渲染 */
export const listHosts = async () => (await get<SysHost[]>('/admin/host/list')) ?? [];

/**
 * #9 POST /admin/host/audit
 * certStatus 必须是整数,后端直接强转 Integer,传字符串会 500。
 * 旧界面「认证通过」发 2、「取消认证」发 3(3 的字典含义是已拒绝),此处 1:1 沿用。
 */
export const auditHost = (hostId: string, certStatus: number) =>
  post<boolean>('/admin/host/audit', { hostId, certStatus });

/** #10 POST /admin/host/delete */
export const deleteHost = (hostId: string) => post<boolean>('/admin/host/delete', { hostId });

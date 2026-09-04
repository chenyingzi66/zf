import { get, post } from './http';
import type { SysUser } from './types';

/** #6 GET /admin/user/list — 全量返回,响应含 password 字段,不得渲染 */
export const listUsers = async () => (await get<SysUser[]>('/admin/user/list')) ?? [];

/** #7 POST /admin/user/delete — 用业务主键 userId */
export const deleteUser = (userId: string) => post<boolean>('/admin/user/delete', { userId });

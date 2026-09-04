import { get, post } from './http';
import type { HouseOrder } from './types';

/** #5 GET /admin/order/list — 全量,后端不排序 */
export const listOrders = async () => (await get<HouseOrder[]>('/admin/order/list')) ?? [];

/** #16 POST /order/delete/{orderNo} — 路径用 orderNo(不是数字 id),body 空对象 */
export const deleteOrder = (orderNo: string) => post<boolean>(`/order/delete/${orderNo}`);

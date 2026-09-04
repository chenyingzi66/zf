import { get, post } from './http';
import type { House } from './types';

/** #4 GET /house/all — 旧界面用的是这个,不是 /admin/house/list */
export const listAllHouses = async () => (await get<House[]>('/house/all')) ?? [];

/**
 * #11 POST /house/audit
 * auditStatus 必须是整数(1 通过 / 2 驳回),后端强转 Integer。
 * 通过会级联 status=1(上架),驳回会级联 status=0。
 * 备注留空时旧界面兜底成「审核通过」/「审核驳回」。
 */
export const auditHouse = (houseId: string, auditStatus: number, auditRemark: string) =>
  post<boolean>('/house/audit', { houseId, auditStatus, auditRemark });

/** #12 POST /house/delete/{houseId} — 路径用业务主键 houseId,body 空对象,不能改成 DELETE */
export const deleteHouse = (houseId: string) => post<boolean>(`/house/delete/${houseId}`);

import { get, post, upload } from './http';
import type { Banner } from './types';

/** #17 GET /banner/all — 后端按 sort 升序 */
export const listBanners = async () => (await get<Banner[]>('/banner/all')) ?? [];

/** #18 POST /upload/banner — 字段名 file,响应 data 是绝对 URL 字符串 */
export const uploadBanner = (file: File) => upload('/upload/banner', file);

/** #19 POST /banner/add */
export const addBanner = (picUrl: string, sort: number) =>
  post<boolean>('/banner/add', { picUrl, sort });

/** #20 POST /banner/update — 只发 id 和 status,其余字段 null 时后端保持原值 */
export const updateBannerStatus = (id: number, status: number) =>
  post<boolean>('/banner/update', { id, status });

/** #21 POST /banner/delete/{id} — 路径用数字主键,body 空对象 */
export const deleteBanner = (id: number) => post<boolean>(`/banner/delete/${id}`);

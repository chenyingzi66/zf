import { get, post } from './http';
import type { Feedback } from './types';

/** #13 GET /admin/feedback/list — 注意别用 /feedback/list,那个缺 token 会返回 500 */
export const listFeedbacks = async () => (await get<Feedback[]>('/admin/feedback/list')) ?? [];

/** #14 POST /feedback/process — 旧界面的回复内容硬编码「已处理」,1:1 沿用 */
export const processFeedback = (id: number, reply = '已处理') =>
  post<boolean>('/feedback/process', { id, reply });

/** #15 POST /feedback/delete — 用数字主键 id */
export const deleteFeedback = (id: number) => post<boolean>('/feedback/delete', { id });

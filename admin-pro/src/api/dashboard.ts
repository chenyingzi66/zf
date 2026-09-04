import { get } from './http';
import type { AdminStat } from './types';

/** #3 GET /admin/stat */
export const getStat = () => get<AdminStat>('/admin/stat');

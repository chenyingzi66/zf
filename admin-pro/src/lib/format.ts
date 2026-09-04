import { API_BASE_URL } from '../api/http';

/**
 * 后端 LocalDateTime 序列化成 ISO 带 T(如 2026-09-03T10:08:54),
 * 旧界面用 replace('T',' ').substring(0,19) 处理,这里保持同样输出。
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

/** LocalDate 字段(checkInDate/checkOutDate)是纯日期,不能套 formatDateTime 的 19 位截断 */
export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return String(value).slice(0, 10);
}

/** 金额展示:旧界面是 ¥ + 原值,不做千分位 */
export function formatMoney(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '¥-';
  return `¥${value}`;
}

/**
 * house.pics 是 JSON 数组字符串;facilities 在测试数据里是逗号串,历史脚本里是 JSON 数组。
 * 两种都要能解析,解析失败就退回单元素数组,绝不抛错。
 */
export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  const text = String(value).trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(item => String(item)).filter(Boolean);
    } catch {
      /* 落到逗号分隔的兜底逻辑 */
    }
  }
  return text
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * 后端返回的图片地址是它自己拼的绝对地址(含 http://localhost:8080)。
 * 换主机名或端口后历史数据会全挂,这里把 origin 重写到当前后端地址。
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const text = String(url).trim();
  if (!text) return '';
  if (text.startsWith('data:')) return text;
  if (/^https?:\/\//i.test(text)) {
    const marker = '/uploads/';
    const index = text.indexOf(marker);
    if (index === -1) return text;
    return `${API_BASE_URL}${text.slice(index)}`;
  }
  return `${API_BASE_URL}${text.startsWith('/') ? '' : '/'}${text}`;
}

/**
 * 随心住后端请求层。
 *
 * 与模版原生请求层的差异(详见 docs/管理端功能与接口对接文档.md §1.2):
 * - 成功码是 200,不是 0
 * - HTTP 状态永远 200,未登录靠 body.code === 401 判断
 * - data 为 null 时字段整个消失,所以信封判定看 'code' 而不是 'data'
 * - 后端没有 refresh token 接口,401 直接清凭据跳登录
 * - 所有写操作都是 POST,路径参数式删除要带空 JSON body
 */

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');

const TOKEN_KEY = 'zf-admin.token';
const USERNAME_KEY = 'zf-admin.username';

interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data?: T;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string {
  if (typeof window === 'undefined') return '管理员';
  return window.localStorage.getItem(USERNAME_KEY) || '管理员';
}

export function saveAuth(token: string, username: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

function notifyAuthenticationRequired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('ao-auth-required'));
}

/** 后端 Result 信封:data 可能整个不存在,所以只能靠 code 判定 */
function isEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return Boolean(body && typeof body === 'object' && 'code' in (body as object));
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error('无法连接后端服务,请确认服务已启动');
  }

  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | T | null;

  if (isEnvelope<T>(body)) {
    if (body.code === 200) return body.data as T;
    if (body.code === 401) {
      clearAuth();
      notifyAuthenticationRequired();
      throw new Error(body.message || '请先登录');
    }
    throw new Error(body.message || '请求失败');
  }

  if (!response.ok) throw new Error(`请求失败（${response.status}）`);

  return body as T;
}

export const get = <T>(path: string) => request<T>(path, { method: 'GET' });

/** 后端所有写操作都是 POST;删除类接口把参数放在路径上,body 传空对象 */
export const post = <T>(path: string, body: unknown = {}) =>
  request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/** 单文件上传,字段名固定 file;响应 data 是绝对 URL 字符串 */
export const upload = (path: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<string>(path, { method: 'POST', body: form });
};

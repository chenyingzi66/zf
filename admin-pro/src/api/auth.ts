import { post, saveAuth, clearAuth } from './http';
import type { LoginResult } from './types';

/** #1 POST /admin/login — username 必须是 admin,失败统一返回「用户名或密码错误」 */
export async function login(username: string, password: string): Promise<LoginResult> {
  const result = await post<LoginResult>('/admin/login', { username, password });
  saveAuth(result.token, result.username);
  return result;
}

/** #2 POST /admin/changePassword — 只改后端 JVM 内存里的静态字段,重启失效 */
export const changePassword = (oldPassword: string, newPassword: string) =>
  post<boolean>('/admin/changePassword', { oldPassword, newPassword });

/** 后端没有登出接口,前端清凭据即可 */
export const logout = () => clearAuth();

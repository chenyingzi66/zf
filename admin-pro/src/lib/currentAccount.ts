/**
 * 当前登录账号。后端只有一个硬编码的 admin 账号,也没有用户资料接口,
 * 所以这里只从登录时保存的用户名派生展示信息,不再有模版那套「前端自选角色」逻辑。
 */
import { getUsername } from '../api/http';

export interface CurrentAccount {
  name: string;
  account: string;
  email: string;
  role: string;
  avatar: string;
}

export function getCurrentAccount(): CurrentAccount {
  const username = getUsername();
  return {
    name: username,
    account: username,
    email: '随心住管理后台',
    role: '管理员',
    avatar: '',
  };
}

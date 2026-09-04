/**
 * 后端实体类型。字段与 Java 实体一一对应(MyBatis-Plus 驼峰映射),
 * 依据 docs/管理端功能与接口对接文档.md §4。
 */

/** 管理员登录返回 */
export interface LoginResult {
  token: string;
  username: string;
}

/** GET /admin/stat */
export interface AdminStat {
  userCount: number;
  hostCount: number;
  houseCount: number;
  orderCount: number;
}

/** sys_user。注意 password 是 MD5,接口会返回,任何界面都不得渲染 */
export interface SysUser {
  id: number;
  userId: string;
  phone: string;
  nickname: string;
  avatar: string;
  password?: string;
  realName?: string;
  idCard?: string;
  createTime: string;
  updateTime?: string;
}

/** sys_host。password 同样不得渲染 */
export interface SysHost {
  id: number;
  hostId: string;
  phone: string;
  name: string;
  avatar?: string;
  password?: string;
  realName?: string;
  idCard?: string;
  /** 0 未认证 1 审核中 2 已认证 3 已拒绝 */
  certStatus: number;
  /** 1 正常 0 禁用,后端没有任何接口能改 */
  status?: number;
  createTime: string;
  updateTime?: string;
}

/** house。pics 是 JSON 数组字符串,facilities 可能是逗号串也可能是 JSON */
export interface House {
  id: number;
  houseId: string;
  hostId: string;
  title: string;
  province: string;
  city: string;
  district: string;
  address: string;
  price: number;
  rentType: string;
  area: number;
  houseType: string;
  orientation: string;
  floor: string;
  pics: string;
  facilities: string;
  description: string;
  viewCount: number;
  /** 0 未上架 1 已上架 2 已下架 */
  status: number;
  /** 0 待审核 1 审核通过 2 审核驳回 */
  auditStatus: number;
  auditRemark: string;
  createTime: string;
  updateTime?: string;
}

/** house_order。checkInDate/checkOutDate 是纯日期,其余时间带 T */
export interface HouseOrder {
  id: number;
  orderNo: string;
  userId: string;
  hostId: string;
  houseId: string;
  houseTitle: string;
  houseImage?: string;
  houseAddress?: string;
  housePrice?: number;
  rentPrice: number;
  rentType: string;
  checkInDate?: string;
  checkOutDate?: string;
  days?: number;
  months?: number;
  rentCount?: number;
  unitPrice?: number;
  rentAmount?: number;
  deposit?: number;
  totalAmount: number;
  /** 0 待确认 1 已确认 2 租住中 3 已完结 4 已取消 5 已拒绝 */
  orderStatus: number;
  guestName?: string;
  guestPhone?: string;
  realName?: string;
  idCard?: string;
  phone?: string;
  contractSigned?: number;
  remark?: string;
  createTime: string;
  updateTime?: string;
}

/** feedback。status:0 未处理 1 已处理 */
export interface Feedback {
  id: number;
  userId: string;
  userType?: string;
  type: string;
  content: string;
  status: number;
  reply?: string;
  createTime: string;
  updateTime?: string;
}

/** banner。status:1 启用 0 禁用;sort 后端按升序取 */
export interface Banner {
  id: number;
  picUrl: string;
  sort: number;
  status: number;
  createTime?: string;
  updateTime?: string;
}

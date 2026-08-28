// config/index.js - 全局配置
module.exports = {
  apiBaseUrl: 'http://localhost:8080',
  apiTimeout: 10000,
  
  statusCode: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    TOKEN_EXPIRED: 4001,
    TOKEN_INVALID: 4002,
    PERMISSION_DENIED: 4003
  },

  userRole: {
    TENANT: 'tenant',
    LANDLORD: 'landlord'
  },

  orderStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    PAID: 'paid',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  houseStatus: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ONLINE: 'online',
    OFFLINE: 'offline'
  },

  landlordAuthStatus: {
    UNVERIFIED: 'unverified',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  feedbackType: {
    COMPLAINT: 'complaint',
    SUGGESTION: 'suggestion',
    BUG: 'bug',
    OTHER: 'other'
  },

  messageType: {
    TEXT: 'text',
    IMAGE: 'image',
    SYSTEM: 'system'
  },

  pagination: {
    pageSize: 10,
    maxPageSize: 50
  },

  upload: {
    maxSize: 5 * 1024 * 1024,
    maxCount: 9,
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp']
  },

  map: {
    key: 'YOUR_MAP_KEY',
    defaultLocation: {
      latitude: 39.908823,
      longitude: 116.397470
    }
  },

  storageKeys: {
    TOKEN: 'token',
    USER_INFO: 'userInfo',
    USER_ROLE: 'userRole',
    PRIVACY_AGREED: 'hasAgreedPrivacy',
    SEARCH_HISTORY: 'searchHistory'
  }
};

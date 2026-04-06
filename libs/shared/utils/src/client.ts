/**
 * Client-only entry: use this in browser apps (tenant-manage-app, hr-app, hr-manager-app)
 * to avoid pulling in @gateway-workspace/database (Prisma) which is server-only.
 */
export { default as apiClient } from './lib/apiClient';
export { ACCESS_TOKEN_KEY } from './lib/constants/token.constant';
export { getToken, setToken, removeToken } from './lib/token';

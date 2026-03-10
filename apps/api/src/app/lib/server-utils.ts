import { verifyJWT } from './jwt';

export const getBranchFromCookie = async (branch?: string) => {
  return branch;
};

export const getCurrentUser = async (token?: string) => {
  try {
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return {
      userId:
        typeof payload.userId === 'string'
          ? parseInt(payload.userId, 10)
          : payload.userId,
      userName: payload.userName,
      role: payload.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

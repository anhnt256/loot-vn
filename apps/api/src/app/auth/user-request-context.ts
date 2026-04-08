import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserRequestContext {
  userId: number;
  userName: string;
  fullName?: string;
  role: string;
  loginType: string;
  isAdmin?: boolean;
  staffType?: string;
  rankId?: number;
  // client-specific
  computerId?: number;
  computerName?: string;
  macAddress?: string;
  machineGroupId?: number | null;
  // staff-specific
  staffId?: number;
  workShifts?: any[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserRequestContext | undefined, ctx: ExecutionContext): UserRequestContext | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserRequestContext = request.user;
    return data ? user?.[data] : user;
  },
);

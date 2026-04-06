import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyJWT } from '../lib/jwt';
import { UserRequestContext } from './user-request-context';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const user: UserRequestContext = {
      userId: Number(payload.userId),
      userName: payload.userName ?? '',
      fullName: payload.fullName,
      role: payload.role ?? '',
      loginType: payload.loginType ?? '',
      isAdmin: payload.isAdmin ?? false,
      staffType: payload.staffType,
      // client-specific
      computerId: payload.computerId ? Number(payload.computerId) : undefined,
      computerName: payload.computerName,
      macAddress: payload.macAddress,
      machineGroupId: payload.machineGroupId != null ? Number(payload.machineGroupId) : null,
      // staff-specific
      staffId: payload.staffId ? Number(payload.staffId) : undefined,
      workShifts: payload.workShifts,
    };

    request.user = user;
    return true;
  }
}

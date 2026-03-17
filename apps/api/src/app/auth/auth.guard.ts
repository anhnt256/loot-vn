import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyJWT } from '../lib/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token =
      request.headers['authorization']?.split(' ')[1] ||
      request.headers['token'] ||
      request.cookies?.['token'];
    if (!token && request.headers['cookie']) {
      const match = /(?:^|;\s*)token=([^;]*)/.exec(request.headers['cookie']);
      if (match) token = decodeURIComponent(match[1].trim());
    }
    if (!token && request.headers['cookie']) {
      const staffMatch = /(?:^|;\s*)staffToken=([^;]*)/.exec(request.headers['cookie']);
      if (staffMatch) token = decodeURIComponent(staffMatch[1].trim());
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = payload;
    return true;
  }
}

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
    const token =
      request.headers['authorization']?.split(' ')[1] ||
      request.headers['token'] ||
      request.cookies?.['token'];

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

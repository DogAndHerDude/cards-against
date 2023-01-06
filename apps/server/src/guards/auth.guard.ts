import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { WsInvalidCredentialsException } from '@/auth/WsInvalidCredentialsException';
import { WsNotAuthorizedException } from '@/auth/WsNotAuthorizedException';
import { AuthorizedSocket } from '@/sockets/AuthorizedSocket';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const host = context.switchToWs();
    const client = host.getClient<AuthorizedSocket>();
    const { auth } = client.handshake;

    if (!auth?.token) {
      throw new WsNotAuthorizedException();
    }

    try {
      const jwtData = await this.authService.verifyJWT(auth.token);

      client.user = jwtData;

      return true;
    } catch (error) {
      throw new WsInvalidCredentialsException();
    }
  }
}

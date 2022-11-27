import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type JWTPayload = { id: string };

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public generateJWT(id: string): string {
    return this.jwtService.sign({
      id,
    });
  }

  public async verifyJWT(token: string): Promise<JWTPayload> {
    return await this.jwtService.verifyAsync<JWTPayload>(token);
  }
}

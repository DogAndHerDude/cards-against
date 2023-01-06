import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type JWTPayload = { id: string };
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async generateJWT(id: string) {
    return await this.jwtService.signAsync({
      id,
    });
  }

  public async verifyJWT(token: string): Promise<JWTPayload> {
    return await this.jwtService.verifyAsync<JWTPayload>(token);
  }
}

import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({ secret: '!' }), UserModule],
  providers: [AuthService, AuthController],
  exports: [AuthService],
})
export class AuthModule {}

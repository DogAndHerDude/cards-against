import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { UserExistsError } from '@/user/errors/UserExistsError';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger();

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  public async login(@Body() { name }: LoginDTO) {
    try {
      const user = this.userService.createUser(name);
      const token = await this.authService.generateJWT(user.id);

      return { token };
    } catch (error) {
      if (error instanceof UserExistsError) {
        throw new ConflictException('User with given name already exists.');
      }

      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }
}

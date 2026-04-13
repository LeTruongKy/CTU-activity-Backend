import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../../decorators/customize';

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    return await this.authService.login(req.user, response);
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  getAccount(@Req() req: any) {
    const user = req?.user;
    return {
      message: 'User account information',
      user,
    };
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    // Support both cookies and Authorization header
    let refreshToken = req?.cookies?.['refresh_token'] as string | undefined;
    
    if (!refreshToken) {
      // Try to get from Authorization header
      const authHeader = req?.headers?.['authorization'] as string | undefined;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.slice(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found in cookies or Authorization header');
    }
    return await this.authService.refreshToken(refreshToken, response);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    return await this.authService.handleLogout(response, req?.user);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRolesService } from '../user_roles/user_roles.service';
import { RolesService } from '../roles/roles.service';
import { UnitsService } from '../units/units.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  studentCode?: string;
  unitId?: number;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userRolesService: UserRolesService,
    private rolesService: RolesService,
    private unitsService: UnitsService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  getHashPassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    // Check if user is BANNED
    if (user.status === 'BANNED') {
      throw new ForbiddenException('User account is banned');
    }

    const isValidPassword = compareSync(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Fetch user role
    const userRole = await this.userRolesService.findByUserId(user.id);
    const role = userRole ? userRole.role?.name : 'STUDENT';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...result } = user;
    return { ...result, role };
  }

  generateAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  generateRefreshToken(payload: any) {
    const expiresIn =
      this.configService.get<string>('REFRESH_TOKEN_expiresIn') || '7d';
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: expiresIn as any,
    } as any);
    return refreshToken;
  }

  async login(user: any, response: Response) {
    const {
      id,
      email,
      fullName,
      studentCode,
      status,
      avatarUrl,
      unitId,
      role,
    } = user as Record<string, unknown>;

    // Double-check BANNED status
    if (status === 'BANNED') {
      throw new ForbiddenException('User account is banned');
    }

    const payload = {
      sub: id as string,
      email: email as string,
      fullName: fullName as string,
      studentCode: studentCode as string | undefined,
      unitId: unitId as number,
      role: role as string,
      iss: 'ctu-activity-backend',
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    await this.usersService.updateRefreshToken(id as string, refreshToken);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      message: 'Login successfully',
      accessToken,
      user: {
        id,
        email,
        fullName,
        studentCode,
        status,
        avatarUrl,
        unitId,
        role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, studentCode, unitId } = registerDto;
    console.log('Registering user with email:', email, 'and unitId:', unitId);
    // Verify unit exists
    const unit = await this.unitsService.findOne(unitId);
    if (!unit) {
      throw new NotFoundException(
        `Unit with ID ${unitId} not found. Please provide a valid unit ID.`,
      );
    }

    // Email validation is handled by DTO validators (@ctu.edu.vn)
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        `Email: ${email} already exists in the system. Please use a different email.`,
      );
    }

    // Check if student code already exists (if provided)
    if (studentCode) {
      const existingStudentCode = await this.usersService.findByStudentCode(studentCode);
      if (existingStudentCode) {
        throw new BadRequestException(
          `Student code: ${studentCode} already exists in the system.`,
        );
      }
    }

    const newUserResult = await this.usersService.create({
      email,
      password,
      fullName,
      studentCode,
      unitId,
    });

    // newUserResult should be a User object from usersService.create
    const newUser = Array.isArray(newUserResult) ? newUserResult[0] : newUserResult;

    // Auto-assign STUDENT role
    const studentRole = await this.rolesService.findByName('STUDENT');
    if (!studentRole) {
      throw new Error('STUDENT role not found in system');
    }

    await this.userRolesService.create({
      userId: (newUser as any).id,
      roleId: studentRole.id,
      unitId: (newUser as any).unitId,
    });
    
    return {
      message: 'Registration successful. You have been assigned the STUDENT role.',
      user: {
        id: (newUser as any).id,
        email: (newUser as any).email,
        fullName: (newUser as any).fullName,
        studentCode: (newUser as any).studentCode,
        unitId: (newUser as any).unitId,
        unitName: unit.name,
        role: 'STUDENT',
      },
    };
  }

  async handleLogout(response: Response, user: IUser | undefined) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.usersService.updateRefreshToken(user.id, null);
    response.clearCookie('refresh_token');
    return { message: 'Logout successfully' };
  }

  async refreshToken(refreshToken: string, response: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        console.warn(`User not found for id: ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is BANNED
      if (user.status === 'BANNED') {
        throw new ForbiddenException('User account is banned');
      }

      if (user.refreshToken !== refreshToken) {
        console.warn(`Refresh token mismatch for user: ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        studentCode: user.studentCode,
        unitId: user.unitId,
        role: payload.role,
        iss: 'ctu-activity-backend',
      };

      const newAccessToken = this.generateAccessToken(newPayload);
      const newRefreshToken = this.generateRefreshToken(newPayload);

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

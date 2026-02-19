import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Matches(/@ctu\.edu\.vn$/, {
    message: 'Email must be a CTU email address ending with @ctu.edu.vn',
  })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  password: string;

  @IsString()
  fullName: string;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;

  @IsString()
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Student code must contain only uppercase letters and numbers',
  })
  studentCode?: string;
}

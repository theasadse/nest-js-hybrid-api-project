import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: "John Doe", description: "User full name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "password123",
    description: "User password (min 6 characters)",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.USER,
    description: "User role",
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

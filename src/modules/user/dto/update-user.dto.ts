import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Role } from "@prisma/client";

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "John Doe", description: "User full name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: "newpassword123",
    description: "User password (min 6 characters)",
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: Role, description: "User role" })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ example: true, description: "Is user active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

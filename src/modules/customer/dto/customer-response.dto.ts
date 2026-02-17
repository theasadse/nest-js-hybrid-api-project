import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  company: string | null;

  @ApiPropertyOptional({ example: '123 Main St' })
  address: string | null;

  @ApiPropertyOptional({ example: 'New York' })
  city: string | null;

  @ApiPropertyOptional({ example: 'USA' })
  country: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

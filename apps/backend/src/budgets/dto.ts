import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class BudgetItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  description!: string;

  @IsString()
  type!: 'PART' | 'LABOR' | 'MANUAL';

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateBudgetDto {
  @IsString()
  serviceOrderId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  items!: BudgetItemDto[];

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  discountFixed?: number;

  @IsOptional()
  @IsString()
  technicalNotes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiryDays?: number;
}

export class PublicBudgetActionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

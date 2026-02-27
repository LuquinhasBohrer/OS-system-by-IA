import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class EquipmentDto {
  @IsString()
  equipmentType!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsString()
  reportedIssue!: string;
}

export class CreateServiceOrderDto {
  @IsString()
  technicianId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  newClient?: { name: string; phone: string; email?: string; cpfCnpj?: string };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentDto)
  equipments!: EquipmentDto[];
}

import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class AddPlantInput {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  plants: string[];
}

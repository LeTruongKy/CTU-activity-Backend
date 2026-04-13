import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

/**
 * DTO for updating user's preferred categories/interests
 * Takes an array of category IDs
 */
export class UpdateUserInterestsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  categoryIds: number[];
}

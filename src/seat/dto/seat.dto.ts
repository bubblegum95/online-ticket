import { IsNotEmpty, IsNumber } from 'class-validator';

export class SeatDto {
  @IsNumber()
  @IsNotEmpty({ message: '행을 입력해주세요.' })
  row: number;

  @IsNumber()
  @IsNotEmpty({ message: '열을 입력해주세요.' })
  column: number;

  @IsNumber()
  @IsNotEmpty({ message: '기본 가격을 입력해주세요.' })
  defaultPrice: number;

  @IsNumber()
  @IsNotEmpty({ message: '차등 수수료를 1~5 로 지정해주세요.' })
  priceLevel: number;
}

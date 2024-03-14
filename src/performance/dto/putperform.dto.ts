import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Category } from '../types/category.type';
import { SaleStatus } from '../types/salestatus.type';

export class PutPerformDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해 주세요.' })
  performName: string;

  @IsString()
  @IsNotEmpty({ message: '섬네일을 업로드해주세요.' })
  thumbnail: string;

  @IsString()
  @IsNotEmpty({ message: '행사가 시작하는 일자를 입력해주세요.' })
  startDate: Date;

  @IsString()
  @IsNotEmpty({ message: '행사가 진행되는 장소를 입력해주세요.' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: '행사의 상세내용을 입력해주세요.' })
  content: string;

  @IsEnum(Category)
  @IsNotEmpty({ message: '행사의 카테고리를 지정해주세요.' })
  category: Category;

  @IsEnum(SaleStatus)
  @IsNotEmpty({ message: '행사의 티켓 판매 상태를 지정해주세요.' })
  sale: SaleStatus;
}

import { PartialType } from '@nestjs/swagger';
import { CreateAnnotatorDto } from './create-annotator.dto';

export class UpdateAnnotatorDto extends PartialType(CreateAnnotatorDto) {}

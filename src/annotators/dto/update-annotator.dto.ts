import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnotatorDto } from './create-annotator.dto';

export class UpdateAnnotatorDto extends PartialType(CreateAnnotatorDto) {}

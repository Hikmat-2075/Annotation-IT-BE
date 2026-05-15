export class AnnotatorResponseDto {
  _id: string;
  name: string;
  email: string;
  completed_tasks: string[];
  total_annotated: number;
  last_login?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

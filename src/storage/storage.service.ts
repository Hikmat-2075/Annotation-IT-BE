import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
  ): Promise<string> {
    const s3Client = this.createS3Client();
    const bucket = this.getRequiredConfig('S3_BUCKET');
    const key = this.buildObjectKey(folder, fileName);

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: 'image/jpeg',
        }),
      );

      return this.buildPublicUrl(bucket, key);
    } catch {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`);
    }

    return value;
  }

  private createS3Client() {
    return new S3Client({
      region: this.configService.get<string>('S3_REGION') ?? 'us-east-1',
      endpoint: this.getRequiredConfig('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.getRequiredConfig('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.getRequiredConfig('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  private buildObjectKey(folder: string, fileName: string) {
    const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
    const sanitizedFileName = fileName.replace(/^\/+/g, '');

    return `${sanitizedFolder}/${sanitizedFileName}`;
  }

  private buildPublicUrl(bucket: string, key: string) {
    const publicUrl =
      this.configService.get<string>('S3_PUBLIC_URL') ??
      this.getRequiredConfig('S3_ENDPOINT');

    return `${publicUrl.replace(/\/+$/g, '')}/${bucket}/${key}`;
  }
}

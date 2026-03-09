import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadService {
  private client: OSS;
  private cdnDomain: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new OSS({
      region: this.config.get('OSS_REGION')!,
      accessKeyId: this.config.get('OSS_ACCESS_KEY_ID')!,
      accessKeySecret: this.config.get('OSS_ACCESS_KEY_SECRET')!,
      bucket: this.config.get('OSS_BUCKET')!,
      endpoint: this.config.get('OSS_ENDPOINT'),
    });
    this.cdnDomain = this.config.get('OSS_CDN_DOMAIN', '')!;
  }

  async upload(file: Express.Multer.File) {
    const key = `mold/${Date.now()}-${file.originalname}`;
    const result = await this.client.put(key, Buffer.from(file.buffer));
    const url = this.cdnDomain
      ? `${this.cdnDomain}/${key}`
      : result.url;

    const record = await this.prisma.fileRecord.create({
      data: {
        name: file.originalname,
        url,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
    return record;
  }

  async delete(fileId: number) {
    const file = await this.prisma.fileRecord.findUnique({ where: { id: fileId } });
    if (!file) return;
    const key = new URL(file.url).pathname.slice(1);
    await this.client.delete(key);
    await this.prisma.fileRecord.delete({ where: { id: fileId } });
  }
}

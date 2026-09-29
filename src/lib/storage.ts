import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StorageProvider {
  uploadImage(file: File): Promise<string>;
}

export class LocalDiskStorageProvider implements StorageProvider {
  private uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  async uploadImage(file: File): Promise<string> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('শুধুমাত্র JPEG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে।');
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      throw new Error('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারে।');
    }

    await fs.mkdir(this.uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
    const randomName = `${crypto.randomUUID()}${ext}`;
    const destinationPath = path.join(this.uploadsDir, randomName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(destinationPath, buffer);

    return `/uploads/${randomName}`;
  }
}

export const storage = new LocalDiskStorageProvider();

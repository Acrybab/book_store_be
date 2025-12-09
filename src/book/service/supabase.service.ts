/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  );
  async uploadFile(bucket: string, fileName: string, fileBuffer: Buffer, contentType: string) {
    const { error } = await this.supabase.storage.from(bucket).upload(fileName, fileBuffer, {
      contentType,
      upsert: true,
    });
    if (error) {
      throw new HttpException(error.message, 400);
    }
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

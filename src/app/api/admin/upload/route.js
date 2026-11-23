import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/auth';

const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'فایلی ارسال نشد.' }, { status: 400 });
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ error: 'فقط JPG / PNG / WebP مجاز است.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم فایل بیشتر از ۵ مگابایت است.' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);

    return NextResponse.json({ ok: true, url: `/uploads/${name}` }, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/upload:', e);
    return NextResponse.json({ error: 'خطای سرور در آپلود.' }, { status: 500 });
  }
}

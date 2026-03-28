import { NextResponse } from 'next/server';
import { importTranscriptFromPdfBuffer } from '@/server/services/transcript-import-service';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'PDF 파일이 필요합니다.' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const imported = await importTranscriptFromPdfBuffer(buffer, file.name);
  return NextResponse.json(imported);
}

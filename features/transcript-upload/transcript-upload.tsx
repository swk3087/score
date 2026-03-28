'use client';

import type { ChangeEvent } from 'react';
interface Props {
  onFileSelected: (file: File) => void;
  loading: boolean;
}

export function TranscriptUpload({ onFileSelected, loading }: Props) {
  return (
    <div className="card">
      <h3>1) 성적표 PDF 업로드</h3>
      <input type="file" accept="application/pdf" onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && onFileSelected(e.target.files[0])} />
      {loading && <p className="small">PDF 파싱 중...</p>}
    </div>
  );
}

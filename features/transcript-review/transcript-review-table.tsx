'use client';

import type { ChangeEvent } from 'react';
import type { TranscriptRow } from '@/entities/transcript';

interface Props {
  rows: TranscriptRow[];
  onChange: (rows: TranscriptRow[]) => void;
}

export function TranscriptReviewTable({ rows, onChange }: Props) {
  const updateRawScore = (rowId: string, semester: 1 | 2, value: string) => {
    const numeric = value === '' ? null : Number(value);
    onChange(
      rows.map((row) =>
        row.id === rowId
          ? semester === 1
            ? { ...row, semester1RawScore: numeric }
            : { ...row, semester2RawScore: numeric }
          : row,
      ),
    );
  };

  if (!rows.length) return <div className="card small">아직 불러온 성적 데이터가 없습니다.</div>;

  return (
    <div className="card">
      <h3>2) 자동입력 검토 및 수정</h3>
      <table>
        <thead>
          <tr>
            <th>학년</th>
            <th>교과</th>
            <th>과목</th>
            <th>1학기 성취도</th>
            <th>1학기 원점수</th>
            <th>2학기 성취도</th>
            <th>2학기 원점수</th>
            <th>경고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.grade}</td>
              <td>{row.subjectGroup}</td>
              <td>{row.subjectName}</td>
              <td>{row.semester1Achievement ?? '-'}</td>
              <td>
                <input value={row.semester1RawScore ?? ''} onChange={(e: ChangeEvent<HTMLInputElement>) => updateRawScore(row.id, 1, e.target.value)} />
              </td>
              <td>{row.semester2Achievement ?? '-'}</td>
              <td>
                <input value={row.semester2RawScore ?? ''} onChange={(e: ChangeEvent<HTMLInputElement>) => updateRawScore(row.id, 2, e.target.value)} />
              </td>
              <td className="warning">{row.warnings.map((w) => w.message).join(', ') || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

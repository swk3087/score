'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TranscriptUpload } from '@/features/transcript-upload/transcript-upload';
import { TranscriptReviewTable } from '@/features/transcript-review/transcript-review-table';
import { NonAcademicForm } from '@/features/non-academic-form/non-academic-form';
import { mapTranscriptRowsToSubjectGrades } from '@/features/score-calculator/subject-grade-mapper';
import { PolicyBanner } from '@/shared/ui/policy-banner';
import { POLICY_BANNER } from '@/shared/config/policy';
import type { NonAcademicInput } from '@/entities/non-academic';
import type { TranscriptRow } from '@/entities/transcript';

const initialNonAcademic: NonAcademicInput = {
  attendance: {
    mode: 'detailed',
    detailed: {
      grade1: { unexcusedAbsence: 0, unexcusedTardy: 0, unexcusedEarlyLeave: 0, unexcusedClassAbsence: 0 },
      grade2: { unexcusedAbsence: 0, unexcusedTardy: 0, unexcusedEarlyLeave: 0, unexcusedClassAbsence: 0 },
      grade3: { unexcusedAbsence: 0, unexcusedTardy: 0, unexcusedEarlyLeave: 0, unexcusedClassAbsence: 0 },
    },
  },
  volunteer: { mode: 'hours', totalHours: 0 },
  schoolActivity: {
    mode: 'detailed',
    detailed: { awardCountBySemester: { '1-1': 0, '1-2': 0, '2-1': 0, '2-2': 0, '3-1': 0, '3-2': 0 }, officerMonths: 0 },
  },
};

export default function CalculatorPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TranscriptRow[]>([]);
  const [nonAcademic, setNonAcademic] = useState<NonAcademicInput>(initialNonAcademic);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const subjectGrades = useMemo(() => mapTranscriptRowsToSubjectGrades(rows), [rows]);

  const handleFileSelected = async (file: File) => {
    setLoading(true);
    setErrors([]);
    const form = new FormData();
    form.append('file', file);

    const response = await fetch('/api/transcript/import', { method: 'POST', body: form });
    const data = (await response.json()) as { rows: TranscriptRow[]; errors?: Array<{ message: string }> };
    setRows(data.rows ?? []);
    setErrors(data.errors?.map((item) => item.message) ?? []);
    setLoading(false);
  };

  const handleCalculate = async () => {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectGrades, nonAcademic }),
    });
    const result = await response.json();
    sessionStorage.setItem('calculation-result', JSON.stringify(result));
    router.push('/calculator/result');
  };

  return (
    <main>
      <h1>중학교 내신 계산기</h1>
      <PolicyBanner message={POLICY_BANNER} />
      <TranscriptUpload onFileSelected={handleFileSelected} loading={loading} />
      {errors.length > 0 && <div className="card warning">{errors.join(', ')}</div>}
      <TranscriptReviewTable rows={rows} onChange={setRows} />
      <NonAcademicForm value={nonAcademic} onChange={setNonAcademic} />
      <div className="card">
        <h3>5) 계산</h3>
        <p className="small">자동입력 이후 수동수정 여부는 결과에 함께 표시됩니다.</p>
        <button disabled={!subjectGrades.length} onClick={handleCalculate}>
          200점 환산 계산하기
        </button>
      </div>
    </main>
  );
}

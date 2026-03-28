'use client';

import type { CalculationResult } from '@/entities/calculation-result';
import { PolicyBanner } from '@/shared/ui/policy-banner';

export function ResultSummary({ result }: { result: CalculationResult }) {
  return (
    <main>
      <div className="card">
        <h2>계산 결과</h2>
        <div className="kpi">{result.totalScore} / 200</div>
        <p className="small">교과 {result.breakdown.academicSubtotal} / 150</p>
      </div>
      <PolicyBanner message={result.policyMessage} />
      <div className="card">
        <h3>세부 내역</h3>
        <ul>
          <li>1-2 일반교과: {result.breakdown.generalSemesters.grade1Semester2}</li>
          <li>2-1 일반교과: {result.breakdown.generalSemesters.grade2Semester1}</li>
          <li>2-2 일반교과: {result.breakdown.generalSemesters.grade2Semester2}</li>
          <li>3-1 일반교과(원점): {result.breakdown.generalSemesters.grade3Semester1}</li>
          <li>3학년 환산 총점(3-1 × 2): {result.breakdown.generalSemesters.grade3PromotedTotal}</li>
          <li>체육·예술: {result.breakdown.peArts}</li>
          <li>출결: {result.breakdown.attendance}</li>
          <li>봉사: {result.breakdown.volunteer}</li>
          <li>학교활동: {result.breakdown.schoolActivity}</li>
        </ul>
      </div>
    </main>
  );
}

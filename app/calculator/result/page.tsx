'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CalculationResult } from '@/entities/calculation-result';
import { ResultSummary } from '@/features/result-summary/result-summary';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('calculation-result');
    if (!raw) {
      router.replace('/calculator');
      return;
    }
    setResult(JSON.parse(raw) as CalculationResult);
  }, [router]);

  if (!result) {
    return (
      <main>
        <div className="card">결과를 불러오는 중...</div>
      </main>
    );
  }

  return <ResultSummary result={result} />;
}

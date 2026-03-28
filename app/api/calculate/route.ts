import { NextResponse } from 'next/server';
import { calculateScore } from '@/server/services/calculation-service';
import type { NonAcademicInput } from '@/entities/non-academic';
import type { SubjectGrade } from '@/entities/subject-grade';

interface CalculateRequest {
  subjectGrades: SubjectGrade[];
  nonAcademic: NonAcademicInput;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CalculateRequest;
  if (!Array.isArray(body.subjectGrades)) {
    return NextResponse.json({ message: '교과 데이터가 필요합니다.' }, { status: 400 });
  }

  const result = calculateScore(body.subjectGrades, body.nonAcademic);
  return NextResponse.json(result);
}

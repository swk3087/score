import type { CalculationPolicy } from '@/entities/calculation-policy';

export const DEFAULT_POLICY: CalculationPolicy = {
  id: 'gyeonggi-2027-custom-no-3-2',
  mode: 'custom',
  includeGrade3Semester2: false,
  promoteGrade3Semester1ToFullGradeWeight: true,
  totalMax: 200,
  academicMax: 150,
  generalSubjectMax: 120,
  peArtsMax: 30,
};

export const POLICY_BANNER =
  '커스텀 정책 적용: 3학년 2학기 미반영 / 3학년 1학기 성적으로 3학년 전체 비율 환산';

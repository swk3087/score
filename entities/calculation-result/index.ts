import type { CalculationPolicy } from '@/entities/calculation-policy';

export interface CalculationBreakdown {
  generalSemesters: {
    grade1Semester2: number;
    grade2Semester1: number;
    grade2Semester2: number;
    grade3Semester1: number;
    grade3PromotedTotal: number;
  };
  peArts: number;
  attendance: number;
  volunteer: number;
  schoolActivity: number;
  academicSubtotal: number;
}

export interface CalculationResult {
  totalScore: number;
  breakdown: CalculationBreakdown;
  policy: CalculationPolicy;
  policyMessage: string;
  warnings: string[];
  inputSnapshot: string;
}

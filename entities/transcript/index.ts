import type { AchievementGrade } from '@/entities/subject-grade';

export interface TranscriptRow {
  id: string;
  grade: 1 | 2 | 3;
  subjectGroup: string;
  subjectName: string;
  semester1Achievement: AchievementGrade;
  semester1RawScore: number | null;
  semester1Average: number | null;
  semester2Achievement: AchievementGrade;
  semester2RawScore: number | null;
  semester2Average: number | null;
  confidence: number;
  warnings: ImportWarning[];
}

export interface ImportWarning {
  code: 'UNCERTAIN_PARSE' | 'MISSING_VALUE' | 'INVALID_VALUE';
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface TranscriptImportResult {
  rows: TranscriptRow[];
  warnings: ImportWarning[];
  errors: ValidationError[];
  sourceFilename: string;
}

import type { TranscriptImportResult, TranscriptRow, ImportWarning, ValidationError } from '@/entities/transcript';
import type { AchievementGrade } from '@/entities/subject-grade';
import { createId } from '@/shared/lib/id';

const parseAchievement = (token: string): AchievementGrade => {
  if (!token) return null;
  const normalized = token.trim().toUpperCase();
  if (normalized.startsWith('A')) return 'A';
  if (normalized.startsWith('B')) return 'B';
  if (normalized.startsWith('C')) return 'C';
  if (normalized.startsWith('D')) return 'D';
  if (normalized.startsWith('E')) return 'E';
  if (normalized === 'P') return 'P';
  if (normalized.includes('해당없음')) return null;
  return null;
};

const parseScoreToken = (token: string): { rawScore: number | null; average: number | null } => {
  if (!token || token.includes('해당없음')) return { rawScore: null, average: null };
  const match = token.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return { rawScore: null, average: null };
  return { rawScore: Number(match[1]), average: Number(match[2]) };
};

const validateRow = (row: TranscriptRow): ValidationError[] => {
  const errors: ValidationError[] = [];
  const allRaw = [row.semester1RawScore, row.semester2RawScore].filter((x): x is number => typeof x === 'number');
  allRaw.forEach((score, index) => {
    if (score < 0 || score > 100) {
      errors.push({ field: index === 0 ? 'semester1RawScore' : 'semester2RawScore', message: '원점수는 0~100 사이여야 합니다.' });
    }
  });
  return errors;
};

export const importTranscriptFromPdfBuffer = async (buffer: ArrayBuffer, sourceFilename: string): Promise<TranscriptImportResult> => {
  const text = new TextDecoder('latin1').decode(buffer);
  const lines = text.split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean);

  const rows: TranscriptRow[] = [];
  const warnings: ImportWarning[] = [];
  const errors: ValidationError[] = [];

  lines.forEach((line: string) => {
    const chunks = line.split(/\s{2,}|\t/).map((item: string) => item.trim()).filter(Boolean);
    const grade = chunks.find((value: string) => /^([123])학년$/.test(value))?.[0];
    if (!grade || chunks.length < 5) return;

    const rowWarning: ImportWarning[] = [];
    const sem1Ach = parseAchievement(chunks[chunks.length - 4] ?? '');
    const sem1Score = parseScoreToken(chunks[chunks.length - 3] ?? '');
    const sem2Ach = parseAchievement(chunks[chunks.length - 2] ?? '');
    const sem2Score = parseScoreToken(chunks[chunks.length - 1] ?? '');

    if (!sem1Ach && sem1Score.rawScore === null) {
      rowWarning.push({ code: 'UNCERTAIN_PARSE', message: '1학기 성적 파싱 확신도가 낮습니다.', field: 'semester1' });
    }

    const row: TranscriptRow = {
      id: createId(),
      grade: Number(grade) as 1 | 2 | 3,
      subjectGroup: chunks[1] ?? '미분류',
      subjectName: chunks[2] ?? '과목',
      semester1Achievement: sem1Ach,
      semester1RawScore: sem1Score.rawScore,
      semester1Average: sem1Score.average,
      semester2Achievement: sem2Ach,
      semester2RawScore: sem2Score.rawScore,
      semester2Average: sem2Score.average,
      confidence: rowWarning.length ? 0.55 : 0.92,
      warnings: rowWarning,
    };

    rows.push(row);
    warnings.push(...rowWarning);
    errors.push(...validateRow(row));
  });

  if (!rows.length) {
    warnings.push({ code: 'UNCERTAIN_PARSE', message: 'PDF에서 표 행을 탐지하지 못했습니다. 수동입력 모드로 전환하세요.' });
  }

  return {
    rows,
    warnings,
    errors,
    sourceFilename,
  };
};

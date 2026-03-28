import type { SubjectGrade } from '@/entities/subject-grade';
import type { TranscriptRow } from '@/entities/transcript';
import { createId } from '@/shared/lib/id';

const peArtsKeywords = ['체육', '음악', '미술', '예술'];

const isPeArts = (subjectGroup: string): boolean => peArtsKeywords.some((keyword) => subjectGroup.includes(keyword));

export const mapTranscriptRowsToSubjectGrades = (rows: TranscriptRow[]): SubjectGrade[] => {
  const out: SubjectGrade[] = [];

  rows.forEach((row) => {
    out.push({
      id: createId(),
      grade: row.grade,
      semester: `${row.grade}-1` as SubjectGrade['semester'],
      subjectGroup: row.subjectGroup,
      subjectName: row.subjectName,
      isPeArts: isPeArts(row.subjectGroup),
      data: {
        achievement: row.semester1Achievement,
        rawScore: row.semester1RawScore,
        classAverage: row.semester1Average,
      },
      source: 'imported',
    });

    out.push({
      id: createId(),
      grade: row.grade,
      semester: `${row.grade}-2` as SubjectGrade['semester'],
      subjectGroup: row.subjectGroup,
      subjectName: row.subjectName,
      isPeArts: isPeArts(row.subjectGroup),
      data: {
        achievement: row.semester2Achievement,
        rawScore: row.semester2RawScore,
        classAverage: row.semester2Average,
      },
      source: 'imported',
    });
  });

  return out;
};

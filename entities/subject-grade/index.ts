export type AchievementGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'P' | null;

export type SemesterKey = '1-1' | '1-2' | '2-1' | '2-2' | '3-1' | '3-2';

export interface SemesterGradeSet {
  achievement: AchievementGrade;
  rawScore: number | null;
  classAverage: number | null;
}

export interface SubjectGrade {
  id: string;
  grade: 1 | 2 | 3;
  subjectGroup: string;
  subjectName: string;
  isPeArts: boolean;
  semester: SemesterKey;
  data: SemesterGradeSet;
  source: 'manual' | 'imported';
}

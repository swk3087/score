import type { CalculationResult } from '@/entities/calculation-result';
import type { NonAcademicInput } from '@/entities/non-academic';
import type { SubjectGrade, AchievementGrade, SemesterKey } from '@/entities/subject-grade';
import { getActivePolicy, getPolicyBanner } from '@/server/services/policy-service';
import { round3 } from '@/shared/lib/round';

const achievementMap: Record<Exclude<AchievementGrade, 'P' | null>, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

const deriveAchievementFromRaw = (rawScore: number): Exclude<AchievementGrade, 'P' | null> => {
  if (rawScore >= 90) return 'A';
  if (rawScore >= 80) return 'B';
  if (rawScore >= 70) return 'C';
  if (rawScore >= 60) return 'D';
  return 'E';
};

const getEffectiveAchievement = (grade: SubjectGrade): number | null => {
  if (grade.data.achievement === 'P') return null;
  if (grade.data.achievement && grade.data.achievement in achievementMap) {
    return achievementMap[grade.data.achievement as keyof typeof achievementMap];
  }
  if (typeof grade.data.rawScore === 'number') {
    return achievementMap[deriveAchievementFromRaw(grade.data.rawScore)];
  }
  return null;
};

const generalFormulaBySemester: Record<SemesterKey, { base: number; achievementMultiplier: number; rawMultiplier: number } | null> = {
  '1-1': null,
  '1-2': { base: 4, achievementMultiplier: 0.8, rawMultiplier: 0.04 },
  '2-1': { base: 8, achievementMultiplier: 1.6, rawMultiplier: 0.08 },
  '2-2': { base: 8, achievementMultiplier: 1.6, rawMultiplier: 0.08 },
  '3-1': { base: 10, achievementMultiplier: 2, rawMultiplier: 0.1 },
  '3-2': { base: 10, achievementMultiplier: 2, rawMultiplier: 0.1 },
};

const computeGeneralSemesterScore = (grades: SubjectGrade[], semester: SemesterKey): number => {
  const formula = generalFormulaBySemester[semester];
  if (!formula) return 0;

  const candidates = grades.filter((row) => !row.isPeArts && row.semester === semester && typeof row.data.rawScore === 'number');
  if (candidates.length === 0) return 0;

  const achievementValues = candidates.map(getEffectiveAchievement).filter((v): v is number => typeof v === 'number');
  const rawValues = candidates.map((row) => row.data.rawScore).filter((v): v is number => typeof v === 'number');

  if (achievementValues.length === 0 || rawValues.length === 0) return 0;

  const achievementAvg = achievementValues.reduce((a, b) => a + b, 0) / achievementValues.length;
  const rawAvg = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
  return round3(formula.base + achievementAvg * formula.achievementMultiplier + rawAvg * formula.rawMultiplier);
};

const computePeArtsScore = (grades: SubjectGrade[]): number => {
  const peArts = grades.filter((row) => row.isPeArts && row.data.achievement && row.data.achievement !== 'P');
  if (peArts.length === 0) return 0;
  const mapped: number[] = peArts
    .map((row) => {
      const grade = row.data.achievement;
      if (grade === 'A') return 30;
      if (grade === 'B') return 24;
      if (grade === 'C') return 18;
      return 0;
    })
    .filter((x) => x > 0);
  if (!mapped.length) return 0;
  return round3(mapped.reduce((a: number, b: number) => a + b, 0) / mapped.length);
};

const attendanceRate = (absences: number): number => {
  if (absences <= 0) return 1;
  if (absences === 1) return 0.9;
  if (absences === 2) return 0.8;
  if (absences === 3) return 0.7;
  if (absences === 4) return 0.6;
  if (absences === 5) return 0.5;
  return 0.4;
};

const calculateAttendance = (input: NonAcademicInput['attendance']): number => {
  if (input.mode === 'simplified' && typeof input.directScore === 'number') return round3(Math.max(0, Math.min(20, input.directScore)));
  if (!input.detailed) return 0;
  const maxByGrade = { grade1: 6, grade2: 7, grade3: 7 } as const;
  return round3(
    (Object.keys(maxByGrade) as Array<keyof typeof maxByGrade>)
      .map((gradeKey) => {
        const g = input.detailed?.[gradeKey] ?? { unexcusedAbsence: 0, unexcusedTardy: 0, unexcusedEarlyLeave: 0, unexcusedClassAbsence: 0 };
        const converted = g.unexcusedAbsence + Math.floor((g.unexcusedTardy + g.unexcusedEarlyLeave + g.unexcusedClassAbsence) / 3);
        return maxByGrade[gradeKey] * attendanceRate(converted);
      })
      .reduce((a, b) => a + b, 0),
  );
};

const calculateVolunteer = (input: NonAcademicInput['volunteer']): number => {
  if (input.mode === 'simplified' && typeof input.directScore === 'number') return round3(Math.max(0, Math.min(20, input.directScore)));
  const hours = input.totalHours ?? 0;
  if (hours >= 15) return 20;
  if (hours >= 8) return round3(hours + 5);
  return 12;
};

const calculateSchoolActivity = (input: NonAcademicInput['schoolActivity']): number => {
  if (input.mode === 'simplified' && typeof input.directScore === 'number') return round3(Math.max(0, Math.min(10, input.directScore)));
  if (!input.detailed) return 8;

  const awardAdditional = Object.values(input.detailed.awardCountBySemester)
    .map((count) => Math.min(1, Math.max(0, count ?? 0)) * 0.5)
    .reduce((a, b) => a + b, 0);

  const officerAdditional = Math.max(0, input.detailed.officerMonths) * 0.1;
  const additional = Math.min(2, awardAdditional + officerAdditional);
  return round3(Math.min(10, 8 + additional));
};

export const calculateScore = (subjectGrades: SubjectGrade[], nonAcademic: NonAcademicInput): CalculationResult => {
  const policy = getActivePolicy();
  const sem12 = computeGeneralSemesterScore(subjectGrades, '1-2');
  const sem21 = computeGeneralSemesterScore(subjectGrades, '2-1');
  const sem22 = computeGeneralSemesterScore(subjectGrades, '2-2');
  const sem31 = computeGeneralSemesterScore(subjectGrades, '3-1');
  const grade3PromotedTotal = round3(sem31 * 2);

  const generalTotal = round3(sem12 + sem21 + sem22 + grade3PromotedTotal);
  const peArts = computePeArtsScore(subjectGrades);
  const academicSubtotal = round3(Math.min(150, generalTotal + peArts));

  const attendance = calculateAttendance(nonAcademic.attendance);
  const volunteer = calculateVolunteer(nonAcademic.volunteer);
  const schoolActivity = calculateSchoolActivity(nonAcademic.schoolActivity);

  const totalScore = round3(academicSubtotal + attendance + volunteer + schoolActivity);

  return {
    totalScore,
    breakdown: {
      generalSemesters: {
        grade1Semester2: sem12,
        grade2Semester1: sem21,
        grade2Semester2: sem22,
        grade3Semester1: sem31,
        grade3PromotedTotal,
      },
      peArts,
      attendance,
      volunteer,
      schoolActivity,
      academicSubtotal,
    },
    policy,
    policyMessage: getPolicyBanner(),
    warnings: ['동점자 처리 규칙은 MVP에서 제외되었습니다.'],
    inputSnapshot: JSON.stringify({ subjectGrades, nonAcademic }),
  };
};

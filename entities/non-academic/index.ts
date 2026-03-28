export interface AttendanceDetailedByGrade {
  unexcusedAbsence: number;
  unexcusedTardy: number;
  unexcusedEarlyLeave: number;
  unexcusedClassAbsence: number;
}

export interface AttendanceInput {
  mode: 'detailed' | 'simplified';
  detailed?: {
    grade1: AttendanceDetailedByGrade;
    grade2: AttendanceDetailedByGrade;
    grade3: AttendanceDetailedByGrade;
  };
  directScore?: number;
}

export interface VolunteerInput {
  mode: 'hours' | 'simplified';
  totalHours?: number;
  directScore?: number;
}

export interface SchoolActivityInput {
  mode: 'detailed' | 'simplified';
  detailed?: {
    awardCountBySemester: Partial<Record<'1-1' | '1-2' | '2-1' | '2-2' | '3-1' | '3-2', number>>;
    officerMonths: number;
  };
  directScore?: number;
}

export interface NonAcademicInput {
  attendance: AttendanceInput;
  volunteer: VolunteerInput;
  schoolActivity: SchoolActivityInput;
}

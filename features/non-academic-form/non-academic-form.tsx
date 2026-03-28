'use client';

import type { ChangeEvent } from 'react';
import type { NonAcademicInput } from '@/entities/non-academic';

interface Props {
  value: NonAcademicInput;
  onChange: (value: NonAcademicInput) => void;
}

export function NonAcademicForm({ value, onChange }: Props) {
  return (
    <div className="card grid">
      <h3>3) 비교과 입력</h3>
      <div className="grid grid-2">
        <label>
          봉사시간(총합)
          <input
            type="number"
            value={value.volunteer.totalHours ?? 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...value,
                volunteer: { ...value.volunteer, mode: 'hours', totalHours: Number(e.target.value) },
              })
            }
          />
        </label>
        <label>
          출결 직접 점수 (간편)
          <input
            type="number"
            value={value.attendance.directScore ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...value,
                attendance: { ...value.attendance, mode: 'simplified', directScore: Number(e.target.value) },
              })
            }
          />
        </label>
        <label>
          학교활동 직접 점수 (간편)
          <input
            type="number"
            value={value.schoolActivity.directScore ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...value,
                schoolActivity: { ...value.schoolActivity, mode: 'simplified', directScore: Number(e.target.value) },
              })
            }
          />
        </label>
      </div>
      <p className="small">상세 입력과 직접 점수 입력이 동시에 있을 때 직접 점수 입력이 우선합니다.</p>
    </div>
  );
}

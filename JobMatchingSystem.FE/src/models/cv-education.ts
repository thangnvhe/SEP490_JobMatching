export const EducationLevel = {
  1: 'Cao đẳng',
  2: 'Đại học',
  3: 'Kỹ sư',
  4: 'Cử nhân',
  5: 'Thạc sĩ',
  6: 'Tiến sĩ',
} as const;

export type EducationLevel = typeof EducationLevel[keyof typeof EducationLevel];

export interface CVEducation {
  id?: number;
  schoolName: string;
  educationLevelId: number;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

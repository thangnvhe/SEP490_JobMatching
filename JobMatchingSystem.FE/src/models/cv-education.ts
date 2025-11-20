export const DegreeType = {
  College: 1,
  Bachelor: 2,
  Master: 3,
  Doctorate: 4,
  Other: 5,
} as const;

export type DegreeType = typeof DegreeType[keyof typeof DegreeType];

export interface CVEducation {
  id?: number;
  schoolName: string;
  degree: DegreeType;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

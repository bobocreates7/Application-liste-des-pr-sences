export interface Class {
  id: string;
  name: string;
  building: string;
}

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  classId: string;
}

export type AbsenceReason = 'Maladie' | 'Transport' | 'Inconnu' | null;

export interface AbsentRecord {
  studentId: string;
  reason: AbsenceReason;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  classId: string;
  isDone: boolean;
  absents: AbsentRecord[];
}


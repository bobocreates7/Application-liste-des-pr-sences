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

export interface AbsentRecord {
  studentId: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  classId: string;
  isDone: boolean;
  absents: AbsentRecord[];
}


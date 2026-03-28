import { Class, Student, DailyAttendance } from './types';

export const initialClasses: Class[] = [
  { id: 'c1', name: '1ère CT', building: 'Bâtiment Principal' },
  { id: 'c2', name: '2ème CT', building: 'Bâtiment Principal' },
  { id: 'c3', name: '3ème CT A', building: 'Bâtiment Principal' },
  { id: 'c4', name: '3ème CT B', building: 'Bâtiment Principal' },
  { id: 'c5', name: '1ère GETO', building: 'Bâtiment Principal' },
  { id: 'c6', name: '2ème GETO', building: 'Bâtiment Principal' },
  { id: 'c7', name: '3ème GETO', building: 'Bâtiment Principal' },
  { id: 'c8', name: '1ère IG', building: 'Bâtiment Principal' },
  { id: 'c9', name: '2ème IG', building: 'Bâtiment Principal' },
  { id: 'c10', name: '3ème IG', building: 'Bâtiment Principal' },
  { id: 'c11', name: '1ère IT', building: 'Bâtiment Principal' },
  { id: 'c12', name: '2ème IT', building: 'Bâtiment Principal' },
  { id: 'c13', name: '3ème IT', building: 'Bâtiment Principal' },
];

export const initialStudents: Student[] = [];

export const initialAttendances: DailyAttendance[] = [];

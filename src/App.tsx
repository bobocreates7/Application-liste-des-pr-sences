/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Class, Student, DailyAttendance, AbsenceReason } from './types';
import { initialClasses, initialStudents, initialAttendances } from './data';
import Dashboard from './components/Dashboard';
import ClassAttendance from './components/ClassAttendance';
import GlobalReport from './components/GlobalReport';
import DataManagement from './components/DataManagement';
import { NotificationService } from './services/notificationService';

export default function App() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
  
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);

  // Initialize StatusBar
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#1A73E8' });
      StatusBar.setOverlaysWebView({ overlay: false });
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const storedStudents = localStorage.getItem('app_students');
    const storedAttendances = localStorage.getItem('app_attendances');

    // Always use the latest classes from data.ts
    setClasses(initialClasses);

    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
      if (storedAttendances) setAttendances(JSON.parse(storedAttendances));
    } else {
      setStudents(initialStudents);
      setAttendances(initialAttendances);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('app_students', JSON.stringify(students));
    localStorage.setItem('app_attendances', JSON.stringify(attendances));
  }, [students, attendances]);

  // Schedule notifications for overdue tasks
  useEffect(() => {
    if (classes.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const completedToday = attendances.filter(a => a.date === today && a.isDone);
    const pendingCount = classes.length - completedToday.length;
    
    NotificationService.scheduleOverdueReminder(pendingCount);
  }, [classes, attendances]);

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
    setShowReport(false);
  };

  const currentAttendance = attendances.find(a => a.classId === selectedClassId && a.date === currentDate) || {
    date: currentDate,
    classId: selectedClassId || '',
    isDone: false,
    absents: []
  };

  const handleUpdateStudentStatus = (studentId: string, isAbsent: boolean, reason?: AbsenceReason) => {
    if (!selectedClassId) return;

    setAttendances(prev => {
      const existingIndex = prev.findIndex(a => a.classId === selectedClassId && a.date === currentDate);
      
      let newAbsents = [...currentAttendance.absents];
      
      if (isAbsent) {
        // Add or update absent record
        const existingAbsentIndex = newAbsents.findIndex(a => a.studentId === studentId);
        if (existingAbsentIndex >= 0) {
          newAbsents[existingAbsentIndex] = { studentId, reason: reason || 'Inconnu' };
        } else {
          newAbsents.push({ studentId, reason: reason || 'Inconnu' });
        }
      } else {
        // Remove absent record
        newAbsents = newAbsents.filter(a => a.studentId !== studentId);
      }

      const newAttendance: DailyAttendance = {
        ...currentAttendance,
        absents: newAbsents
      };

      if (existingIndex >= 0) {
        const newAttendances = [...prev];
        newAttendances[existingIndex] = newAttendance;
        return newAttendances;
      } else {
        return [...prev, newAttendance];
      }
    });
  };

  const handleValidateClass = (classId: string) => {
    setAttendances(prev => {
      const existingIndex = prev.findIndex(a => a.classId === classId && a.date === currentDate);
      
      if (existingIndex >= 0) {
        const newAttendances = [...prev];
        newAttendances[existingIndex] = { ...newAttendances[existingIndex], isDone: true };
        return newAttendances;
      } else {
        return [...prev, { date: currentDate, classId, isDone: true, absents: [] }];
      }
    });

    const absentCount = currentAttendance.absents.length;

    toast.success('Appel validé et synchronisé !', {
      description: `${absentCount} absent(s) signalé(s).`,
      style: {
        background: '#43A047',
        color: 'white',
        border: 'none',
      }
    });

    setSelectedClassId(null);
  };

  const handleAddStudents = (newStudents: Student[]) => {
    setStudents(prev => [...prev, ...newStudents]);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-[#1A73E8] selection:text-white">
      {showDataManagement && (
        <DataManagement 
          classes={classes}
          students={students}
          onAddStudents={handleAddStudents}
          onDeleteStudent={handleDeleteStudent}
          onClose={() => setShowDataManagement(false)}
        />
      )}
      {showReport ? (
        <GlobalReport 
          currentDate={currentDate}
          attendances={attendances}
          classes={classes}
          students={students}
          onBack={handleBackToDashboard}
        />
      ) : selectedClassId ? (
        <ClassAttendance 
          classData={classes.find(c => c.id === selectedClassId)!}
          students={students.filter(s => s.classId === selectedClassId)}
          absents={currentAttendance.absents}
          onBack={handleBackToDashboard}
          onUpdateStatus={handleUpdateStudentStatus}
          onValidate={handleValidateClass}
        />
      ) : (
        <Dashboard 
          classes={classes} 
          attendances={attendances}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onSelectClass={handleSelectClass} 
          onOpenReport={() => setShowReport(true)}
          onOpenDataManagement={() => setShowDataManagement(true)}
        />
      )}
      <Toaster position="top-center" />
    </div>
  );
}


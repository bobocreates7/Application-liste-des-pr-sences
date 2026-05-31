/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Users, FileBarChart, Bell } from 'lucide-react';
import { Class, Student, DailyAttendance } from './types';
import { initialClasses, initialStudents, initialAttendances } from './data';
import Dashboard from './components/Dashboard';
import ClassAttendance from './components/ClassAttendance';
import GlobalReport from './components/GlobalReport';
import DataManagement from './components/DataManagement';
import Notifications from './components/Notifications';
import SideMenu from './components/SideMenu';
import { NotificationService } from './services/notificationService';

export type TabType = 'home' | 'students' | 'reports' | 'notifications';

export default function App() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
  
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize StatusBar and BackButton
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#1A73E8' });
      StatusBar.setOverlaysWebView({ overlay: false });

      // Ensure splash screen stays for at least 3 seconds
      setTimeout(() => {
        SplashScreen.hide();
      }, 3000);

      CapacitorApp.addListener('backButton', () => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (selectedClassId) {
          setSelectedClassId(null);
        } else if (activeTab !== 'home') {
          setActiveTab('home');
        } else if (filter !== 'all') {
          setFilter('all');
        } else if (searchTerm !== '') {
          setSearchTerm('');
        } else {
          CapacitorApp.exitApp();
        }
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, [isMenuOpen, selectedClassId, activeTab, filter, searchTerm]);

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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827'; // gray-900
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f3f4f6'; // gray-100
    }
  }, [isDarkMode]);

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
  };

  const currentAttendance = attendances.find(a => a.classId === selectedClassId && a.date === currentDate) || {
    date: currentDate,
    classId: selectedClassId || '',
    isDone: false,
    absents: []
  };

  const handleUpdateStudentStatus = (studentId: string, isAbsent: boolean) => {
    if (!selectedClassId) return;

    setAttendances(prev => {
      const existingIndex = prev.findIndex(a => a.classId === selectedClassId && a.date === currentDate);
      
      let newAbsents = [...currentAttendance.absents];
      
      if (isAbsent) {
        // Add or update absent record
        const existingAbsentIndex = newAbsents.findIndex(a => a.studentId === studentId);
        if (existingAbsentIndex >= 0) {
          newAbsents[existingAbsentIndex] = { studentId };
        } else {
          newAbsents.push({ studentId });
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
      const now = new Date().toISOString();
      
      if (existingIndex >= 0) {
        const newAttendances = [...prev];
        newAttendances[existingIndex] = { ...newAttendances[existingIndex], isDone: true, completedAt: now };
        return newAttendances;
      } else {
        return [...prev, { date: currentDate, classId, isDone: true, absents: [], completedAt: now }];
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

  const getUncompletedCount = () => {
    let missedDays = 0;
    const d = new Date();
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip weekends
        const dateStr = d.toISOString().split('T')[0];
        const completedCount = attendances.filter(a => a.date === dateStr && a.isDone).length;
        if (completedCount < classes.length) {
            missedDays++;
        }
    }
    return missedDays;
  };

  const uncompletedCount = getUncompletedCount();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'} text-gray-900 dark:text-gray-100 font-sans selection:bg-[#1A73E8] selection:text-white overflow-hidden flex flex-col`}>
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedClassId ? (
            <motion.div key="class" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="h-full w-full absolute top-0 left-0 bg-gray-50 dark:bg-gray-900 flex flex-col z-30">
              <ClassAttendance 
                classData={classes.find(c => c.id === selectedClassId)!}
                students={students.filter(s => s.classId === selectedClassId)}
                absents={currentAttendance.absents}
                attendances={attendances}
                onBack={handleBackToDashboard}
                onUpdateStatus={handleUpdateStudentStatus}
                onValidate={handleValidateClass}
              />
            </motion.div>
          ) : (
            <motion.div key="main-tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full w-full absolute top-0 left-0 bg-gray-50 dark:bg-gray-900 flex flex-col">
              <div className="flex-1 overflow-hidden relative">
                {activeTab === 'home' && (
                  <Dashboard 
                    classes={classes} 
                    students={students}
                    attendances={attendances}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onSelectClass={handleSelectClass} 
                    onOpenMenu={() => setIsMenuOpen(true)}
                    filter={filter}
                    setFilter={setFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                )}
                {activeTab === 'students' && (
                  <DataManagement 
                    classes={classes}
                    students={students}
                    onAddStudents={handleAddStudents}
                    onDeleteStudent={handleDeleteStudent}
                  />
                )}
                {activeTab === 'reports' && (
                  <GlobalReport 
                    currentDate={currentDate}
                    attendances={attendances}
                    classes={classes}
                    students={students}
                  />
                )}
                {activeTab === 'notifications' && (
                  <Notifications 
                    classes={classes}
                    attendances={attendances}
                    onDateChange={setCurrentDate}
                    onClose={() => setActiveTab('home')}
                  />
                )}
              </div>

              {/* Bottom Navigation Navbar */}
              <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 shadow-[0_-8px_16px_-1px_rgba(0,0,0,0.03)] w-full">
                <div className="flex justify-around items-center h-[64px] max-w-md mx-auto px-2">
                  <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'home' ? 'text-[#1A73E8] dark:text-[#3B82F6]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'home' ? 'bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]' : ''}`}>
                      <Home strokeWidth={activeTab === 'home' ? 2.5 : 2} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">Accueil</span>
                  </button>
                  
                  <button onClick={() => setActiveTab('students')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'students' ? 'text-[#1A73E8] dark:text-[#3B82F6]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'students' ? 'bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]' : ''}`}>
                      <Users strokeWidth={activeTab === 'students' ? 2.5 : 2} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">Élèves</span>
                  </button>

                  <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'reports' ? 'text-[#1A73E8] dark:text-[#3B82F6]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]' : ''}`}>
                      <FileBarChart strokeWidth={activeTab === 'reports' ? 2.5 : 2} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">Rapports</span>
                  </button>

                  <button onClick={() => setActiveTab('notifications')} className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${activeTab === 'notifications' ? 'text-[#1A73E8] dark:text-[#3B82F6]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'notifications' ? 'bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]' : ''} relative`}>
                      <Bell strokeWidth={activeTab === 'notifications' ? 2.5 : 2} className="w-5 h-5" />
                      {uncompletedCount > 0 && (
                        <span className="absolute 1 top-1.5 right-1.5 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-900">
                          {uncompletedCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">Alertes</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Toaster position="top-center" theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
}


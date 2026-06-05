import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, MapPin, CheckCircle2, Circle, Calendar as CalendarIcon, Menu, X, Folder } from 'lucide-react';
import { Class, DailyAttendance, Student } from '../types';
import { UserRole } from './PortalSelect';

let dashboardScrollPos = 0;

interface DashboardProps {
  classes: Class[];
  students: Student[];
  attendances: DailyAttendance[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onSelectClass: (id: string) => void;
  onOpenMenu: () => void;
  filter: 'all' | 'todo' | 'done';
  setFilter: (f: 'all' | 'todo' | 'done') => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  role: UserRole;
}

export default function Dashboard({ 
  classes, 
  students,
  attendances, 
  currentDate, 
  onDateChange, 
  onSelectClass,
  onOpenMenu,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  role
}: DashboardProps) {

  const [selectedStudentForAbsences, setSelectedStudentForAbsences] = useState<Student | null>(null);

  const classesWithStatus = classes.map(c => {
    const attendance = attendances.find(a => a.classId === c.id && a.date === currentDate);
    return {
      ...c,
      isDone: attendance?.isDone || false,
      absentsCount: attendance?.absents.length || 0
    };
  });

  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = dashboardScrollPos;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    dashboardScrollPos = e.currentTarget.scrollTop;
  };

  const filteredClasses = classesWithStatus.filter(c => {
    const matchesFilter = filter === 'all' ? true : filter === 'todo' ? !c.isDone : c.isDone;
    return matchesFilter;
  });

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return students.filter(s => s.firstName.toLowerCase().includes(term) || s.lastName.toLowerCase().includes(term));
  }, [searchTerm, students]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 flex-1 relative">
      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold tracking-tight">CESCOM LP</h1>
          <button onClick={onOpenMenu} className="p-1 -mr-1 hover:bg-white/20 rounded-full transition-colors active:bg-white/30">
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center bg-white/10 rounded-xl p-0.5 mb-3">
          <CalendarIcon className="w-4 h-4 ml-3 mr-2 text-white/80" />
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent border-none text-white focus:ring-0 font-medium w-full py-1.5 text-sm cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter('todo')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'todo' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            À faire
          </button>
          <button 
            onClick={() => setFilter('done')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'done' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Faites
          </button>
        </div>
      </header>

      {/* Class/Student List */}
      <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-3">
        {searchTerm.trim() ? (
          filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Aucun élève trouvé.
            </div>
          ) : (
            filteredStudents.map(student => {
              const studentClass = classes.find(c => c.id === student.classId);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentForAbsences(student)}
                  className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between active:scale-[0.98] transition-transform gap-3"
                >
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white uppercase">{student.lastName} <span className="capitalize font-medium text-gray-600 dark:text-gray-300">{student.firstName}</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{studentClass?.name || 'Classe inconnue'}</p>
                  </div>
                </button>
              );
            })
          )
        ) : (
          filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Aucune classe trouvée.
            </div>
          ) : (
            filteredClasses.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectClass(c.id)}
                className="w-full text-left bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between active:scale-[0.98] transition-transform group"
                style={{ minHeight: '64px' }}
              >
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">{c.building}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {c.isDone && c.absentsCount > 0 && (
                  <span className="text-xs font-medium text-[#E53935] dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">
                    {c.absentsCount} absent{c.absentsCount > 1 ? 's' : ''}
                  </span>
                )}
                <div className="flex items-center justify-center w-8 h-8">
                  {c.isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-[#43A047]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
              </div>
            </button>
          ))
          )
        )}
      </main>

      {/* Absences Modal */}
      {selectedStudentForAbsences && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col max-h-[80vh] border border-white/20 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 flex justify-between items-start border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase">{selectedStudentForAbsences.lastName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedStudentForAbsences.firstName}</p>
              </div>
              <button 
                onClick={() => setSelectedStudentForAbsences(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <div className="flex items-center gap-2 mb-4 text-[#E53935] dark:text-red-400">
                <CalendarIcon className="w-5 h-5" />
                <h4 className="font-semibold text-[15px]">Historique d'absences</h4>
              </div>
              
              <div className="flex flex-col gap-2">
                {attendances
                  .filter(a => a.isDone && a.absents.some(ab => ab.studentId === selectedStudentForAbsences.id))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(a => (
                    <div key={a.date} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0"></div>
                       <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                         {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                       </span>
                    </div>
                ))}
                {attendances.filter(a => a.isDone && a.absents.some(ab => ab.studentId === selectedStudentForAbsences.id)).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">Aucune absence enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

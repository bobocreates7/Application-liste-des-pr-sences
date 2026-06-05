import { useState } from 'react';
import { ArrowLeft, Check, Search, Folder, X, Calendar as CalendarIcon } from 'lucide-react';
import { Class, Student, AbsentRecord, DailyAttendance } from '../types';
import { UserRole } from './PortalSelect';

interface ClassAttendanceProps {
  classData: Class;
  students: Student[];
  absents: AbsentRecord[];
  attendances: DailyAttendance[];
  onBack: () => void;
  onUpdateStatus: (studentId: string, isAbsent: boolean) => void;
  onValidate: (classId: string) => void;
  role: UserRole;
}

export default function ClassAttendance({ 
  classData, 
  students, 
  absents,
  attendances,
  onBack, 
  onUpdateStatus, 
  onValidate,
  role
}: ClassAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAbsences, setSelectedStudentForAbsences] = useState<Student | null>(null);
  
  const absentCount = absents.length;

  const filteredStudents = students
    .filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const reversedFullName = `${student.lastName} ${student.firstName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) || reversedFullName.includes(searchLower);
    })
    .sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 flex-1 relative">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{classData.name}</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      {/* Student List */}
      <main className="flex-1 overflow-y-auto pb-36">
        <div className="p-3 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/50 focus:border-[#1A73E8] transition-colors text-sm shadow-sm"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Aucun élève trouvé.
            </div>
          ) : (
            filteredStudents.map(student => {
              const absentRecord = absents.find(a => a.studentId === student.id);
              const isAbsent = !!absentRecord;

              return (
                <div key={student.id} className="bg-white dark:bg-gray-800 p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-3 flex items-start gap-3">
                      <button 
                         onClick={() => setSelectedStudentForAbsences(student)} 
                         className="mt-0.5 p-1.5 text-gray-400 dark:text-gray-500 hover:text-[#1A73E8] dark:hover:text-[#3B82F6] bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent dark:border-gray-600 shrink-0"
                         title="Voir l'historique des absences"
                      >
                         <Folder className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <p className="text-base font-medium text-gray-900 dark:text-white uppercase">{student.lastName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.firstName}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => role === 'prefet' && onUpdateStatus(student.id, false)}
                        disabled={role === 'prof'}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all ${
                          !isAbsent 
                            ? 'bg-[#43A047] text-white shadow-md scale-105' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${role === 'prof' ? 'opacity-70 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => role === 'prefet' && onUpdateStatus(student.id, true)}
                        disabled={role === 'prof'}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all ${
                          isAbsent 
                            ? 'bg-[#E53935] text-white shadow-md scale-105' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${role === 'prof' ? 'opacity-70 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-transparent pt-10 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 flex flex-col gap-2 pointer-events-auto">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Absents</span>
            <span className={`text-lg font-bold ${absentCount > 0 ? 'text-[#E53935] dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {absentCount}
            </span>
          </div>
          
          {role === 'prefet' && (
            <button
              onClick={() => onValidate(classData.id)}
              className="w-full bg-[#1A73E8] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Check className="w-5 h-5" />
              Valider la classe
            </button>
          )}
        </div>
      </div>

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
                  .filter(a => a.classId === classData.id && a.isDone && a.absents.some(ab => ab.studentId === selectedStudentForAbsences.id))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(a => (
                    <div key={a.date} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shrink-0"></div>
                       <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                         {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                       </span>
                    </div>
                ))}
                {attendances.filter(a => a.classId === classData.id && a.isDone && a.absents.some(ab => ab.studentId === selectedStudentForAbsences.id)).length === 0 && (
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

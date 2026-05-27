import { useState } from 'react';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { Class, Student, AbsentRecord } from '../types';

interface ClassAttendanceProps {
  classData: Class;
  students: Student[];
  absents: AbsentRecord[];
  onBack: () => void;
  onUpdateStatus: (studentId: string, isAbsent: boolean) => void;
  onValidate: (classId: string) => void;
}

export default function ClassAttendance({ 
  classData, 
  students, 
  absents,
  onBack, 
  onUpdateStatus, 
  onValidate 
}: ClassAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
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
                    <div className="flex-1 pr-3">
                      <p className="text-base font-medium text-gray-900 dark:text-white uppercase">{student.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.firstName}</p>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onUpdateStatus(student.id, false)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all ${
                          !isAbsent 
                            ? 'bg-[#43A047] text-white shadow-md scale-105' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => onUpdateStatus(student.id, true)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all ${
                          isAbsent 
                            ? 'bg-[#E53935] text-white shadow-md scale-105' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
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
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-transparent pt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Absents</span>
            <span className={`text-lg font-bold ${absentCount > 0 ? 'text-[#E53935] dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {absentCount}
            </span>
          </div>
          
          <button
            onClick={() => onValidate(classData.id)}
            className="w-full bg-[#1A73E8] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Check className="w-5 h-5" />
            Valider la classe
          </button>
        </div>
      </div>
    </div>
  );
}

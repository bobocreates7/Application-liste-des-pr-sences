import { useState } from 'react';
import { ArrowLeft, Check, Search, ChevronDown } from 'lucide-react';
import { Class, Student, AbsentRecord, AbsenceReason } from '../types';

interface ClassAttendanceProps {
  classData: Class;
  students: Student[];
  absents: AbsentRecord[];
  onBack: () => void;
  onUpdateStatus: (studentId: string, isAbsent: boolean, reason?: AbsenceReason) => void;
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

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const reversedFullName = `${student.lastName} ${student.firstName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || reversedFullName.includes(searchLower);
  });

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{classData.name}</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Student List */}
      <main className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 bg-gray-50 sticky top-0 z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/50 focus:border-[#1A73E8] transition-colors text-lg shadow-sm"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Aucun élève trouvé.
            </div>
          ) : (
            filteredStudents.map(student => {
              const absentRecord = absents.find(a => a.studentId === student.id);
              const isAbsent = !!absentRecord;

              return (
                <div key={student.id} className="bg-white p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-lg font-medium text-gray-900 uppercase">{student.lastName}</p>
                      <p className="text-gray-500">{student.firstName}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateStatus(student.id, false)}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                          !isAbsent 
                            ? 'bg-[#43A047] text-white shadow-md scale-105' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => onUpdateStatus(student.id, true, 'Inconnu')}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                          isAbsent 
                            ? 'bg-[#E53935] text-white shadow-md scale-105' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>

                  {/* Reason Selector (only visible if absent) */}
                  {isAbsent && (
                    <div className="pl-4 border-l-2 border-[#E53935] ml-2 mt-2 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      <label className="text-sm text-gray-500 mb-1 block">Motif de l'absence :</label>
                      <div className="relative">
                        <select
                          value={absentRecord.reason || 'Inconnu'}
                          onChange={(e) => onUpdateStatus(student.id, true, e.target.value as AbsenceReason)}
                          className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/50 focus:border-[#E53935]"
                        >
                          <option value="Inconnu">Inconnu</option>
                          <option value="Maladie">Maladie</option>
                          <option value="Transport">Transport</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-gray-600 font-medium">Total Absents</span>
            <span className={`text-xl font-bold ${absentCount > 0 ? 'text-[#E53935]' : 'text-gray-900'}`}>
              {absentCount}
            </span>
          </div>
          
          <button
            onClick={() => onValidate(classData.id)}
            className="w-full bg-[#1A73E8] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-4 text-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Check className="w-6 h-6" />
            Valider la classe
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Class, Student } from '../types';
import { Users, Plus, Trash2, ClipboardPaste, Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { UserRole } from './PortalSelect';
import { Select } from './Select';
import { App as CapacitorApp } from '@capacitor/app';

interface DataManagementProps {
  classes: Class[];
  students: Student[];
  onAddStudents: (students: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteStudents?: (studentIds: string[]) => void;
  role: UserRole;
}

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export default function DataManagement({ classes, students, onAddStudents, onDeleteStudent, onDeleteStudents, role }: DataManagementProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [bulkText, setBulkText] = useState('');
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const handleTouchStart = (studentId: string) => {
    if (role !== 'prefet' || isSelectionMode) return;
    longPressTimerRef.current = window.setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedForDeletion(new Set([studentId]));
      // Vibrate to provide feedback if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isSelectionMode) {
      const listener = CapacitorApp.addListener('backButton', () => {
        setIsSelectionMode(false);
        setSelectedForDeletion(new Set());
      });
      return () => {
        listener.then(l => l.remove());
      };
    }
  }, [isSelectionMode]);

  const classStudents = students
    .filter(s => s.classId === selectedClassId)
    .sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

  const handleBulkAdd = () => {
    if (!selectedClassId) {
      toast.error("Veuillez sélectionner une classe.");
      return;
    }
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newStudents: Student[] = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      
      // Séparer par tabulation, point-virgule, virgule ou espace
      let parts = cleanLine.split(/[\t;,]/);
      if (parts.length === 1) {
         const spaceIndex = cleanLine.indexOf(' ');
         if (spaceIndex > -1) {
           parts = [cleanLine.substring(0, spaceIndex), cleanLine.substring(spaceIndex + 1)];
         } else {
           parts = [cleanLine];
         }
      }
      
      const lastName = parts[0].trim().toUpperCase();
      const firstName = parts.length > 1 ? parts[1].trim() : '';
      
      newStudents.push({
        id: generateId(),
        lastName,
        firstName: firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : '',
        classId: selectedClassId
      });
    });

    if (newStudents.length > 0) {
      onAddStudents(newStudents);
      setBulkText('');
      toast.success(`${newStudents.length} élève(s) ajouté(s) avec succès.`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert array of arrays (e.g. [['DUPONT', 'Jean'], ...]) or text lines
        const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
        
        const lines: string[] = [];
        data.forEach(row => {
          if (row.length > 0) {
            lines.push(row.filter(cell => cell != null && cell !== '').join(' '));
          }
        });

        if (lines.length > 0) {
          setBulkText(prev => prev + (prev.trim() ? '\n' : '') + lines.join('\n'));
          toast.success("Fichier importé avec succès. Vous pouvez maintenant l'ajouter.");
        }
      } catch (error) {
        toast.error("Erreur lors de la lecture du fichier. Assurez-vous d'avoir un format valide.");
        console.error(error);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 flex-1">
      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          {role === 'prefet' ? 'Gérer les élèves' : 'Liste des élèves'}
        </h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden pb-3">
          {/* Left side: Add students */}
          {role === 'prefet' && (
            <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 md:w-1/2 flex flex-col gap-3 shrink-0 md:overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Classe</label>
                <Select 
                  value={selectedClassId}
                  onChange={setSelectedClassId}
                  options={classes.map(c => ({ value: c.id, label: c.name }))}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Ajouter des élèves
                  </label>
                  
                  <input 
                     type="file" 
                     ref={fileInputRef}
                     accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                     className="hidden"
                     onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-[#1A73E8] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Importer Excel/CSV
                  </button>
                </div>
                
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Copiez-collez ou importez un fichier. Format : Nom Prénom (un élève par ligne).
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="DUPONT Jean&#10;MARTIN Sophie"
                  className="w-full flex-1 min-h-[150px] border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleBulkAdd}
                disabled={!bulkText.trim() || !selectedClassId}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors mt-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter à la classe
              </button>
            </div>
          )}

          {/* Right side: Current students */}
          <div className={`p-4 ${role === 'prefet' ? 'md:w-1/2' : 'w-full'} flex flex-col bg-gray-50 dark:bg-gray-900 md:overflow-hidden`}>
            {role === 'prof' && (
              <div className="mb-4">
                <Select 
                  value={selectedClassId}
                  onChange={setSelectedClassId}
                  options={classes.map(c => ({ value: c.id, label: c.name }))}
                />
              </div>
            )}
            
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span>Élèves dans cette classe</span>
                {role === 'prefet' && isSelectionMode && classStudents.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        if (selectedForDeletion.size === classStudents.length) {
                          setSelectedForDeletion(new Set());
                        } else {
                          setSelectedForDeletion(new Set(classStudents.map(s => s.id)));
                        }
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      {selectedForDeletion.size === classStudents.length ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {role === 'prefet' && isSelectionMode && selectedForDeletion.size > 0 && (
                  <button
                    onClick={() => {
                      if (onDeleteStudents) {
                        onDeleteStudents(Array.from(selectedForDeletion));
                        setSelectedForDeletion(new Set());
                        setIsSelectionMode(false);
                      }
                    }}
                    className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 py-0.5 px-2 rounded-md text-[10px] font-bold transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer ({selectedForDeletion.size})
                  </button>
                )}
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
                  {classStudents.length}
                </span>
              </div>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {classStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  Aucun élève dans cette classe.
                  <br />
                  {role === 'prefet' && <span className="text-[10px] mt-1 block">Utilisez le formulaire pour en ajouter.</span>}
                </div>
              ) : (
                classStudents.map((student, index) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-2.5 rounded-lg border shadow-sm select-none transition-colors ${
                      isSelectionMode && selectedForDeletion.has(student.id) 
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                        : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                    onTouchStart={() => handleTouchStart(student.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(student.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    onClick={() => {
                      if (isSelectionMode) {
                        const newSet = new Set(selectedForDeletion);
                        if (newSet.has(student.id)) newSet.delete(student.id);
                        else newSet.add(student.id);
                        setSelectedForDeletion(newSet);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {role === 'prefet' && isSelectionMode && (
                        <input 
                          type="checkbox"
                          checked={selectedForDeletion.has(student.id)}
                          onChange={(e) => {
                            // Handled by parent div onClick
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        <span className="text-gray-500 mr-1">{index + 1}.</span>{student.lastName.toUpperCase()} <span className="text-gray-600 dark:text-gray-400 font-normal">{student.firstName}</span>
                      </span>
                    </div>
                    {role === 'prefet' && !isSelectionMode && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudent(student.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0"
                        title="Supprimer l'élève"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

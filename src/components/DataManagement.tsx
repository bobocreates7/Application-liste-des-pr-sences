import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Class, Student } from '../types';
import { X, Users, Plus, Trash2, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';

interface DataManagementProps {
  classes: Class[];
  students: Student[];
  onAddStudents: (students: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onClose: () => void;
}

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export default function DataManagement({ classes, students, onAddStudents, onDeleteStudent, onClose }: DataManagementProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [bulkText, setBulkText] = useState('');

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Gérer les élèves</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          {/* Left side: Add students */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 md:w-1/2 flex flex-col gap-3 shrink-0 md:overflow-y-auto">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Classe</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <ClipboardPaste className="w-3.5 h-3.5" />
                Coller une liste
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Copiez-collez depuis Excel ou Pronote. Format : Nom Prénom (un par ligne).
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="DUPONT Jean&#10;MARTIN Sophie"
                className="w-full flex-1 min-h-[150px] border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleBulkAdd}
              disabled={!bulkText.trim() || !selectedClassId}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors mt-1"
            >
              <Plus className="w-4 h-4" />
              Ajouter à la classe
            </button>
          </div>

          {/* Right side: Current students */}
          <div className="p-4 md:w-1/2 flex flex-col bg-gray-50 md:overflow-hidden">
            <h3 className="text-xs font-medium text-gray-700 mb-2.5 flex justify-between items-center shrink-0">
              <span>Élèves dans cette classe</span>
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                {classStudents.length}
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {classStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-200">
                  Aucun élève dans cette classe.
                  <br />
                  <span className="text-[10px] mt-1 block">Utilisez le formulaire pour en ajouter.</span>
                </div>
              ) : (
                classStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium text-gray-900 text-sm">
                      {student.lastName} <span className="text-gray-600 font-normal">{student.firstName}</span>
                    </span>
                    <button 
                      onClick={() => onDeleteStudent(student.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      title="Supprimer l'élève"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

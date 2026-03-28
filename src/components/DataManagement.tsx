import React, { useRef, useState } from 'react';
import { Class, Student } from '../types';
import { Upload, X, Download, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DataManagementProps {
  classes: Class[];
  onImport: (students: Student[], replace: boolean) => void;
  onClose: () => void;
}

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

const normalizeStr = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

export default function DataManagement({ classes, onImport, onClose }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replace, setReplace] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // Remove BOM if present
      const text = (e.target?.result as string).replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/);
      const newStudents: Student[] = [];
      let errorCount = 0;

      lines.forEach((line, index) => {
        if (!line.trim()) return; 
        
        // Split by comma, semicolon, or tab, and remove surrounding quotes
        const parts = line.split(/[,;\t]/).map(s => s.replace(/^["']|["']$/g, '').trim());
        
        // Skip header
        if (index === 0 && parts[0].toLowerCase().includes('nom')) return;
        
        if (parts.length >= 3) {
          const lastName = parts[0];
          const firstName = parts[1];
          const className = parts[2];
          
          const matchedClass = classes.find(c => normalizeStr(c.name) === normalizeStr(className));
          
          if (matchedClass && lastName && firstName) {
            newStudents.push({
              id: generateId(),
              lastName,
              firstName,
              classId: matchedClass.id
            });
          } else {
            console.warn("Ligne ignorée :", line, "- Classe trouvée :", !!matchedClass);
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });

      if (newStudents.length > 0) {
        onImport(newStudents, replace);
        toast.success(`${newStudents.length} élèves importés avec succès.`);
        if (errorCount > 0) {
          toast.warning(`${errorCount} lignes ignorées (classe introuvable ou format invalide).`);
        }
        onClose();
      } else {
        toast.error("Aucun élève n'a pu être importé. Vérifiez le format (Nom, Prénom, Classe).");
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = "Nom,Prénom,Classe\nDupont,Jean,1ère IG\nMartin,Sophie,2ème CT";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modele_eleves.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Gérer les élèves</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Importez une liste d'élèves depuis un fichier CSV. Le fichier doit contenir les colonnes : <strong>Nom, Prénom, Classe</strong>.
            </p>
            
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Download className="w-4 h-4" />
              Télécharger un modèle CSV
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-amber-900 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={replace}
                  onChange={(e) => setReplace(e.target.checked)}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                Remplacer la liste existante
              </label>
              <p className="text-xs text-amber-700">
                Si coché, tous les élèves actuels et l'historique des appels seront supprimés avant l'import.
              </p>
            </div>
          </div>

          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            Sélectionner un fichier CSV
          </button>
        </div>
      </div>
    </div>
  );
}

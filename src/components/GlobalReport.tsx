import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Class, Student, DailyAttendance } from '../types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GlobalReportProps {
  currentDate: string;
  attendances: DailyAttendance[];
  classes: Class[];
  students: Student[];
  onBack: () => void;
}

export default function GlobalReport({ 
  currentDate, 
  attendances, 
  classes, 
  students, 
  onBack 
}: GlobalReportProps) {
  
  // Get all attendances for the current date
  const todaysAttendances = attendances.filter(a => a.date === currentDate);
  
  // Calculate total absents
  const totalAbsents = todaysAttendances.reduce((acc, curr) => acc + curr.absents.length, 0);

  // Prepare list of absent students with their class and reason
  const absentDetails = todaysAttendances.flatMap(attendance => {
    const classInfo = classes.find(c => c.id === attendance.classId);
    return attendance.absents.map(absent => {
      const studentInfo = students.find(s => s.id === absent.studentId);
      return {
        student: studentInfo,
        className: classInfo?.name || 'Inconnue',
        reason: absent.reason
      };
    });
  }).filter(detail => detail.student); // Remove any undefined students

  // Sort by class name, then student last name
  absentDetails.sort((a, b) => {
    if (a.className !== b.className) return a.className.localeCompare(b.className);
    return a.student!.lastName.localeCompare(b.student!.lastName);
  });

  const formattedDate = new Date(currentDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(26, 115, 232); // #1A73E8
      doc.text("Rapport Global d'Absences", 14, 22);
      
      // Subtitle / Date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date : ${formattedDate}`, 14, 32);
      
      // Total
      doc.setFontSize(14);
      doc.setTextColor(229, 57, 53); // #E53935
      doc.text(`Total des absents : ${totalAbsents}`, 14, 42);

      // Table Data
      const tableData = absentDetails.map(detail => [
        `${detail.student!.lastName.toUpperCase()} ${detail.student!.firstName}`,
        detail.className,
        detail.reason || 'Non renseigné'
      ]);

      // Generate Table
      autoTable(doc, {
        startY: 50,
        head: [['Élève', 'Classe', 'Motif']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 115, 232] },
        styles: { fontSize: 11, cellPadding: 4 },
      });

      // Save PDF
      doc.save(`rapport-absences-${currentDate}.pdf`);

      toast.success('Export réussi', {
        description: 'Le rapport PDF a été généré et téléchargé.',
        icon: <Download className="w-4 h-4" />
      });
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error('Erreur', {
        description: "Impossible de générer le fichier PDF."
      });
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">Rapport Global</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
          <p className="text-gray-500 font-medium mb-1 capitalize">{formattedDate}</p>
          <h2 className="text-4xl font-black text-[#E53935] mb-2">{totalAbsents}</h2>
          <p className="text-gray-700 font-medium">Élèves absents au total</p>
        </div>

        {/* Detailed List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1A73E8]" />
            Détail des absences
          </h3>
          
          {absentDetails.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">Aucun absent signalé pour cette date.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {absentDetails.map((detail, idx) => (
                <div key={idx} className="p-4 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900 uppercase">
                      {detail.student!.lastName} <span className="capitalize font-medium text-gray-700">{detail.student!.firstName}</span>
                    </p>
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-md">
                      {detail.className}
                    </span>
                  </div>
                  <p className="text-sm text-[#E53935] font-medium flex items-center gap-1 mt-1">
                    Motif : {detail.reason || 'Non renseigné'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-12">
        <button
          onClick={handleExport}
          disabled={absentDetails.length === 0}
          className="w-full bg-[#1A73E8] disabled:bg-gray-300 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-4 text-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <Download className="w-6 h-6" />
          Exporter en PDF
        </button>
      </div>
    </div>
  );
}

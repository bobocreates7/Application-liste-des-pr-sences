import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Class, Student, DailyAttendance } from '../types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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
        className: classInfo?.name || 'Inconnue'
      };
    });
  }).filter(detail => detail.student); // Remove any undefined students

  // Sort by class name, then student last name, then first name
  absentDetails.sort((a, b) => {
    if (a.className !== b.className) return a.className.localeCompare(b.className);
    const lastNameCompare = a.student!.lastName.localeCompare(b.student!.lastName);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.student!.firstName.localeCompare(b.student!.firstName);
  });

  const formattedDate = new Date(currentDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleExport = async () => {
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
        detail.className
      ]);

      // Generate Table
      autoTable(doc, {
        startY: 50,
        head: [['Élève', 'Classe']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 115, 232] },
        styles: { fontSize: 11, cellPadding: 4 },
      });

      const fileName = `rapport-absences-${currentDate}.pdf`;

      if (Capacitor.isNativePlatform()) {
        // Get base64 string of the PDF
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        
        // Save file to device
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
        });

        // Share the file
        await Share.share({
          title: 'Rapport d\'absences',
          text: `Rapport d'absences du ${formattedDate}`,
          url: savedFile.uri,
          dialogTitle: 'Partager le rapport PDF',
        });

        toast.success('Export réussi', {
          description: 'Le rapport PDF a été généré et partagé.',
          icon: <Download className="w-4 h-4" />
        });
      } else {
        // Web fallback
        doc.save(fileName);
        toast.success('Export réussi', {
          description: 'Le rapport PDF a été généré et téléchargé.',
          icon: <Download className="w-4 h-4" />
        });
      }
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
      <header className="bg-[#1A73E8] text-white p-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button 
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold">Rapport Global</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-28">
        {/* Summary Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 text-center">
          <p className="text-gray-500 text-sm font-medium mb-1 capitalize">{formattedDate}</p>
          <h2 className="text-3xl font-black text-[#E53935] mb-1">{totalAbsents}</h2>
          <p className="text-gray-700 text-sm font-medium">Élèves absents au total</p>
        </div>

        {/* Detailed List */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#1A73E8]" />
            Détail des absences
          </h3>
          
          {absentDetails.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm">Aucun absent signalé pour cette date.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {absentDetails.map((detail, idx) => (
                <div key={idx} className="p-3 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900 text-sm uppercase">
                      {detail.student!.lastName} <span className="capitalize font-medium text-gray-700">{detail.student!.firstName}</span>
                    </p>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {detail.className}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10">
        <button
          onClick={handleExport}
          disabled={absentDetails.length === 0}
          className="w-full bg-[#1A73E8] disabled:bg-gray-300 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" />
          Exporter en PDF
        </button>
      </div>
    </div>
  );
}

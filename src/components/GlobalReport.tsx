import { ArrowLeft, Download, FileText, Filter } from "lucide-react";
import { Class, Student, DailyAttendance } from "../types";
import { toast } from "sonner";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Select } from './Select';

import { Trimester, getTrimesterLabel } from "../utils/trimester";

interface GlobalReportProps {
  currentDate: string;
  attendances: DailyAttendance[];
  classes: Class[];
  students: Student[];
  activeTrimester: Trimester;
}

export default function GlobalReport({
  currentDate,
  attendances,
  classes,
  students,
  activeTrimester,
}: GlobalReportProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [reportType, setReportType] = useState<"day" | "month">("day");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    currentDate.substring(0, 7)
  ); // 'YYYY-MM'

  // Get all attendances for the current date
  const todaysAttendances = attendances.filter((a) => a.date === currentDate);

  // Prepare list of absent students with their class and reason
  const allAbsentDetails = todaysAttendances
    .flatMap((attendance) => {
      const classInfo = classes.find((c) => c.id === attendance.classId);
      return attendance.absents.map((absent) => {
        const studentInfo = students.find((s) => s.id === absent.studentId);
        return {
          student: studentInfo,
          className: classInfo?.name || "Inconnue",
          classId: classInfo?.id,
        };
      });
    })
    .filter((detail) => detail.student); // Remove any undefined students

  const absentDetails =
    selectedClassFilter === "all"
      ? allAbsentDetails
      : allAbsentDetails.filter((d) => d.classId === selectedClassFilter);

  // Calculate total absents
  const totalAbsents = absentDetails.length;

  const getStudentOrder = (student: Student) => {
    const classStudents = students
      .filter(s => s.classId === student.classId)
      .sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.firstName.localeCompare(b.firstName);
      });
    return classStudents.findIndex(s => s.id === student.id) + 1;
  };

  // Sort by class name, then student last name, then first name
  absentDetails.sort((a, b) => {
    if (a.className !== b.className)
      return a.className.localeCompare(b.className);
    const lastNameCompare = a.student!.lastName.localeCompare(
      b.student!.lastName
    );
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.student!.firstName.localeCompare(b.student!.firstName);
  });

  const formattedDate = new Date(currentDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Extract the saving logic into a helper
  const savePdf = async (
    doc: jsPDF,
    fileName: string,
    shareTitle: string,
    shareText: string,
    subfolder: string = "Général"
  ) => {
    if (Capacitor.isNativePlatform()) {
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      
      const folderPath = `Rapports/${subfolder.replace(/\//g, "-")}`;
      
      try {
        await Filesystem.mkdir({
          path: folderPath,
          directory: Directory.Documents,
          recursive: true,
        });
      } catch (e) {
        // Directory might already exist, ignore error
      }
      
      const filePath = `${folderPath}/${fileName}`;
      
      const savedFile = await Filesystem.writeFile({
        path: filePath,
        data: pdfBase64,
        directory: Directory.Documents,
      });
      
      try {
        await Share.share({
          title: shareTitle,
          text: shareText,
          url: savedFile.uri,
          dialogTitle: "Enregistrer ou partager le rapport PDF",
        });
        toast.success("Export réussi", {
          description: `Le rapport a été sauvegardé dans Documents/${folderPath}`,
          icon: <Download className="w-4 h-4" />,
        });
      } catch (shareError: any) {
        if (shareError?.message !== "Share canceled") throw shareError;
        toast.success("Export réussi", {
          description: `Le rapport a été sauvegardé dans Documents/${folderPath}`,
          icon: <Download className="w-4 h-4" />,
        });
      }
    } else {
      const blob = doc.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText,
          });
          toast.success("Export réussi", {
            description: "Le rapport PDF a été généré.",
            icon: <Download className="w-4 h-4" />,
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          console.error("Erreur lors du partage:", error);
        }
      }
      if ("showSaveFilePicker" in window) {
        try {
          // @ts-ignore
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Document PDF",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          });
          // @ts-ignore
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast.success("Export réussi", {
            description: "Le rapport PDF a été enregistré.",
            icon: <Download className="w-4 h-4" />,
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          console.error("Erreur lors de l'enregistrement:", error);
        }
      }
      doc.save(fileName);
      toast.success("Export réussi", {
        description: "Le rapport PDF a été téléchargé.",
        icon: <Download className="w-4 h-4" />,
      });
    }
  };

  const handleExportDaily = async () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(26, 115, 232); // #1A73E8
      doc.text("Rapport Global d'Absences", 14, 22);

      // Subtitle / Date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date : ${formattedDate}`, 14, 30);

      // Class Filter Note
      const classFilterName =
        selectedClassFilter === "all"
          ? "Toutes les classes"
          : classes.find((c) => c.id === selectedClassFilter)?.name || "";
      doc.text(`Classe : ${classFilterName} | ${getTrimesterLabel(activeTrimester)}`, 14, 36);

      // Total
      doc.setFontSize(14);
      doc.setTextColor(229, 57, 53); // #E53935
      doc.text(`Total des absents : ${totalAbsents}`, 14, 46);

      // Table Data
      const tableData = absentDetails.map((detail) => [
        `${getStudentOrder(detail.student!)}. ${detail.student!.lastName.toUpperCase()} ${
          detail.student!.firstName
        }`,
        detail.className,
      ]);

      // Generate Table
      autoTable(doc, {
        startY: 52,
        head: [["Élève", "Classe"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [26, 115, 232] },
        styles: { fontSize: 11, cellPadding: 4 },
      });

      const folderName = selectedClassFilter === "all" ? "Toutes les classes" : (classes.find(c => c.id === selectedClassFilter)?.name || "Général");
      
      const fileName = `rapport-absences-${currentDate}.pdf`;
      await savePdf(
        doc,
        fileName,
        "Rapport d'absences",
        `Rapport d'absences du ${formattedDate}`,
        folderName
      );
    } catch (error: any) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur", {
        description: `Impossible de générer le fichier PDF: ${
          error?.message || "Erreur inconnue"
        }`,
      });
    }
  };

  const handleExportMonthly = async () => {
    try {
      if (selectedClassFilter === "all") {
        toast.error("Sélection requise", {
          description: "Veuillez sélectionner une classe spécifique.",
        });
        return;
      }

      // Portrait or Landscape depending on days? A4 Portrait might be too narrow for 22 days. Let's use Landscape.
      const doc = new jsPDF({ orientation: "landscape", format: "a4" });

      const year = parseInt(selectedMonth.split("-")[0]);
      const monthIndex = parseInt(selectedMonth.split("-")[1]) - 1;
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const weekdayNumbers: number[] = [];
      const weekdayLetters: string[] = [];
      const weekdayDateStrings: string[] = []; // 'YYYY-MM-DD'

      const dayLetters = ["D", "L", "M", "M", "J", "V", "S"];

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, monthIndex, i);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // exclude Sunday and Saturday
          weekdayNumbers.push(i);
          weekdayLetters.push(dayLetters[dayOfWeek]);

          const dayString = String(i).padStart(2, "0");
          const monthString = String(monthIndex + 1).padStart(2, "0");
          weekdayDateStrings.push(`${year}-${monthString}-${dayString}`);
        }
      }

      const monthName = new Date(year, monthIndex, 1)
        .toLocaleDateString("fr-FR", { month: "long" })
        .toUpperCase();

      // Title
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("times", "bold");
      doc.text("CESCOM", 14, 20);
      doc.text("B.P : 6412 BUJUMBURA", 14, 28);

      doc.setFontSize(18);
      doc.text("LISTE DES PRESENCES", 148.5, 45, { align: "center" });
      const textWidth = doc.getTextWidth("LISTE DES PRESENCES");
      doc.setLineWidth(0.5);
      doc.line(148.5 - textWidth / 2, 46, 148.5 + textWidth / 2, 46); // Underline

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Trimestre : ${getTrimesterLabel(activeTrimester)}`, 148.5, 53, { align: "center" });

      doc.setFontSize(14);
      doc.text(`MOIS DE: ${monthName}`, 14, 60);

      // Which students to show?
      const targetClasses = classes.filter((c) => c.id === selectedClassFilter);
      let targetStudents = students.filter((s) =>
        targetClasses.some((c) => c.id === s.classId)
      );

      // Sort students
      targetStudents.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.firstName.localeCompare(b.firstName);
      });

      const headRow1 = ["JOURS", ...weekdayLetters];
      const headRow2 = [
        "NOM ET PRENOM",
        ...weekdayNumbers.map((d) => String(d)),
      ];

      const bodyData = targetStudents.map((student) => {
        const row = [`${getStudentOrder(student)}. ${student.lastName.toUpperCase()} ${student.firstName}`];
        weekdayDateStrings.forEach((dateStr) => {
          // Check if there is an attendance record for this class on this date
          const attRecord = attendances.find(
            (a) => a.date === dateStr && a.classId === student.classId
          );
          if (!attRecord) {
            row.push(""); // No explicitly recorded call
          } else {
            const isAbsent = attRecord.absents.some(
              (abs) => abs.studentId === student.id
            );
            row.push(isAbsent ? "A" : "P");
          }
        });
        return row;
      });

      autoTable(doc, {
        startY: 65,
        head: [headRow1, headRow2],
        body: bodyData,
        theme: "grid",
        didParseCell: function (data) {
          if (data.section === "head") {
            if (data.row.index === 0) {
              data.cell.styles.fillColor = [128, 0, 0]; // Dark Red
              data.cell.styles.textColor = [255, 255, 255];
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
                data.cell.styles.fontSize = 12;
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.font = "times";
              } else {
                data.cell.styles.halign = "center";
              }
            } else if (data.row.index === 1) {
              data.cell.styles.fillColor = [255, 255, 255]; // White
              data.cell.styles.textColor = [0, 102, 204]; // Blue
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else {
                data.cell.styles.halign = "center";
              }
            }
          } else if (data.section === "body") {
            if (data.column.index > 0) {
              data.cell.styles.halign = "center";
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          font: "times",
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: "bold" },
        },
      });

      const className = targetClasses[0]?.name.replace(/ /g, "_") || "classe";
      const folderName = targetClasses[0]?.name || "Général";
      const fileName = `presences-${className}-${selectedMonth}.pdf`;
      await savePdf(
        doc,
        fileName,
        "Rapport mensuel",
        `Rapport de présences du mois ${monthName}`,
        folderName
      );
    } catch (error: any) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur", {
        description: `Impossible de générer le fichier PDF: ${
          error?.message || "Erreur inconnue"
        }`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 flex-1 relative">
      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0 flex flex-col gap-3">
        <h1 className="text-xl font-bold tracking-tight">Rapport Global</h1>

        <div className="flex bg-white/20 p-1 rounded-xl">
          <button
            onClick={() => setReportType("day")}
            className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${
              reportType === "day"
                ? "bg-white text-[#1A73E8] shadow-sm"
                : "text-white"
            }`}
          >
            Journalier
          </button>
          <button
            onClick={() => setReportType("month")}
            className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${
              reportType === "month"
                ? "bg-white text-[#1A73E8] shadow-sm"
                : "text-white"
            }`}
          >
            Mensuel
          </button>
        </div>

        {/* Class Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Select
              value={selectedClassFilter}
              onChange={setSelectedClassFilter}
              options={[
                { value: "all", label: "Toutes les classes" },
                ...classes.map(c => ({ value: c.id, label: c.name }))
              ]}
              buttonClassName="bg-white/20 hover:bg-white/30 text-white border-none shadow-none font-medium"
            />
          </div>

          {reportType === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-40 px-3 py-2 border-none rounded-xl bg-white/10 text-white placeholder-white/50 shadow-sm text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 [&::-webkit-calendar-picker-indicator]:invert"
            />
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-24">
        {reportType === "day" ? (
          <>
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 capitalize">
                {formattedDate}
              </p>
              <h2 className="text-3xl font-black text-[#E53935] dark:text-red-400 mb-1">
                {totalAbsents}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Élèves absents au total
              </p>
            </div>

            {/* Detailed List */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1A73E8] dark:text-[#3B82F6]" />
                Détail des absences
              </h3>

              {absentDetails.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Aucun absent signalé pour cette date.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {absentDetails.map((detail, idx) => (
                    <div key={idx} className="p-3 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-900 dark:text-white text-sm uppercase">
                          <span className="text-gray-500 mr-1 font-medium">{getStudentOrder(detail.student!)}.</span>
                          {detail.student!.lastName}{" "}
                          <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
                            {detail.student!.firstName}
                          </span>
                        </p>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {detail.className}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 mt-10">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Rapport Mensuel
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-[280px]">
              Générez un tableau récapitulatif des présences pour une classe
              spécifique sur tout le mois sélectionné.
            </p>
            {selectedClassFilter === "all" && (
              <p className="text-red-500 text-sm font-medium bg-red-50 py-2 px-4 rounded-xl border border-red-100">
                Vous devez sélectionner une classe pour exporter le rapport
                mensuel.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-transparent pt-10">
        <button
          onClick={
            reportType === "day" ? handleExportDaily : handleExportMonthly
          }
          disabled={
            reportType === "day"
              ? absentDetails.length === 0
              : selectedClassFilter === "all"
          }
          className="w-full bg-[#1A73E8] disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" />
          {reportType === "day"
            ? "Exporter en PDF"
            : "Générer le rapport mensuel"}
        </button>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { AnimatePresence, motion } from "motion/react";
import { Home, Users, FileBarChart, Bell } from "lucide-react";
import { Class, Student, DailyAttendance } from "./types";
import { initialClasses } from "./data";
import Dashboard from "./components/Dashboard";
import ClassAttendance from "./components/ClassAttendance";
import GlobalReport from "./components/GlobalReport";
import DataManagement from "./components/DataManagement";
import Notifications from "./components/Notifications";
import SideMenu from "./components/SideMenu";
import { NotificationService } from "./services/notificationService";
import PortalSelect, { UserRole } from "./components/PortalSelect";
import AuthScreen from "./components/AuthScreen";

// Firebase imports
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";

export type TabType = "home" | "students" | "reports" | "notifications";

export function getLocalYMD(d: Date = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getValidSchoolDate(d: Date = new Date()) {
  const currentDay = d.getDay();
  if (currentDay === 6) {
    // Saturday
    d.setDate(d.getDate() - 1);
  } else if (currentDay === 0) {
    // Sunday
    d.setDate(d.getDate() - 2);
  }
  return getLocalYMD(d);
}

export default function App() {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);

  const [currentDate, setCurrentDate] = useState<string>(() =>
    getValidSchoolDate()
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() =>
    localStorage.getItem("app_selected_class")
  );
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (localStorage.getItem("app_active_tab") as TabType) || "home"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("app_dark_mode") === "true");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [schoolUid, setSchoolUid] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize StatusBar and BackButton
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#1A73E8" });
      StatusBar.setOverlaysWebView({ overlay: false });

      // Ensure splash screen stays for at least 3 seconds
      setTimeout(() => {
        SplashScreen.hide();
      }, 3000);

      CapacitorApp.addListener("backButton", () => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (selectedClassId) {
          setSelectedClassId(null);
        } else if (activeTab !== "home") {
          setActiveTab("home");
        } else if (filter !== "all") {
          setFilter("all");
        } else if (searchTerm !== "") {
          setSearchTerm("");
        } else {
          CapacitorApp.exitApp();
        }
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, [isMenuOpen, selectedClassId, activeTab, filter, searchTerm]);

  // Load portal role
  useEffect(() => {
    const storedRole = localStorage.getItem(
      "app_portal_role"
    ) as UserRole | null;
    if (storedRole) {
      setRole(storedRole);
    }

    // Automatically manage authentication state based on Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setSchoolUid(user.uid);
        localStorage.setItem("app_authenticated", "true");
      } else {
        setIsAuthenticated(false);
        setSchoolUid(null);
        localStorage.removeItem("app_authenticated");
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync data with Firebase
  useEffect(() => {
    if (!schoolUid) return;

    let syncedStudents = false;
    let syncedAttendances = false;

    const unsubscribeStudents = onSnapshot(
      collection(db, "schools", schoolUid, "students"),
      (snapshot) => {
        const studs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Student)
        );
        if (!syncedStudents && studs.length === 0) {
          // Migration from local storage
          const localStuds = localStorage.getItem("app_students");
          if (localStuds) {
            const parsedStuds = JSON.parse(localStuds) as Student[];
            if (parsedStuds.length > 0) {
              const batch = writeBatch(db);
              parsedStuds.forEach((s) =>
                batch.set(doc(db, "schools", schoolUid, "students", s.id), s)
              );
              batch.commit();
            }
          }
        }
        syncedStudents = true;
        setStudents(studs);
      },
      (error) => {
        console.error("Students sync error", error);
      }
    );

    const unsubscribeAttendances = onSnapshot(
      collection(db, "schools", schoolUid, "attendances"),
      (snapshot) => {
        const atts = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as DailyAttendance)
        );
        if (!syncedAttendances && atts.length === 0) {
          // Migration from local storage
          const localAtts = localStorage.getItem("app_attendances");
          if (localAtts) {
            const parsedAtts = JSON.parse(localAtts) as DailyAttendance[];
            if (parsedAtts.length > 0) {
              const batch = writeBatch(db);
              parsedAtts.forEach((a) => {
                const id = a.id || `${a.classId}_${a.date}`;
                batch.set(doc(db, "schools", schoolUid, "attendances", id), {
                  ...a,
                  id,
                });
              });
              batch.commit();
            }
          }
        }
        syncedAttendances = true;
        setAttendances(atts);
      },
      (error) => {
        console.error("Attendances sync error", error);
      }
    );

    return () => {
      unsubscribeStudents();
      unsubscribeAttendances();
    };
  }, [schoolUid]);

  // Schedule notifications for overdue tasks
  useEffect(() => {
    if (classes.length === 0) return;

    const today = getLocalYMD();
    const completedToday = attendances.filter(
      (a) => a.date === today && a.isDone
    );
    const pendingCount = classes.length - completedToday.length;

    NotificationService.scheduleOverdueReminder(pendingCount);
  }, [classes, attendances]);

  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem("app_selected_class", selectedClassId);
    } else {
      localStorage.removeItem("app_selected_class");
    }
  }, [selectedClassId]);

  useEffect(() => {
    localStorage.setItem("app_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("app_dark_mode", String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#111827"; // gray-900
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f3f4f6"; // gray-100
    }
  }, [isDarkMode]);

  // Swipe to open/close menu
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 40; // pixels

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      
      const xDiff = touchStartX - touchEndX;
      const yDiff = touchStartY - touchEndY;

      // Ensure gesture is predominantly horizontal
      if (Math.abs(xDiff) > Math.abs(yDiff) * 1.5 && Math.abs(xDiff) > swipeThreshold) {
        if (xDiff > 0) {
          // Swipe Right to Left
          setIsMenuOpen(true);
        } else {
          // Swipe Left to Right
          setIsMenuOpen(false);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
  };

  const currentAttendance = attendances.find(
    (a) => a.classId === selectedClassId && a.date === currentDate
  ) || {
    date: currentDate,
    classId: selectedClassId || "",
    isDone: false,
    absents: [],
  };

  const handleDateChange = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    if (day === 6) {
      // Saturday
      toast.info("Le week-end n'est pas sélectionnable, retour au vendredi.", {
        duration: 2500,
      });
      d.setDate(d.getDate() - 1);
      setCurrentDate(getLocalYMD(d));
    } else if (day === 0) {
      // Sunday
      toast.info("Le week-end n'est pas sélectionnable, saut au vendredi.", {
        duration: 2500,
      });
      d.setDate(d.getDate() - 2);
      setCurrentDate(getLocalYMD(d));
    } else {
      setCurrentDate(dateStr);
    }
  };

  const handleUpdateStudentStatus = async (
    studentId: string,
    isAbsent: boolean
  ) => {
    if (!selectedClassId) return;

    const existingAttendance = attendances.find(
      (a) => a.classId === selectedClassId && a.date === currentDate
    );
    let newAbsents = [...currentAttendance.absents];

    if (isAbsent) {
      const existingAbsentIndex = newAbsents.findIndex(
        (a) => a.studentId === studentId
      );
      if (existingAbsentIndex >= 0) {
        newAbsents[existingAbsentIndex] = { studentId };
      } else {
        newAbsents.push({ studentId });
      }
    } else {
      newAbsents = newAbsents.filter((a) => a.studentId !== studentId);
    }

    const attendanceId =
      existingAttendance?.id || `${selectedClassId}_${currentDate}`;
    const newAttendance = JSON.parse(
      JSON.stringify({
        ...currentAttendance,
        id: attendanceId,
        absents: newAbsents,
      })
    );

    // Optimistic Local State Update
    setAttendances((prev) => {
      const idx = prev.findIndex(
        (a) => a.classId === selectedClassId && a.date === currentDate
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newAttendance;
        return next;
      }
      return [...prev, newAttendance];
    });

    if (!schoolUid) return;
    setDoc(
      doc(db, "schools", schoolUid, "attendances", attendanceId),
      newAttendance
    ).catch((e) => {
      console.error(e);
      toast.error("Erreur de synchronisation en arrière-plan");
    });
  };

  const handleValidateClass = (classId: string) => {
    const existingAttendance = attendances.find(
      (a) => a.classId === classId && a.date === currentDate
    );
    const now = new Date().toISOString();
    const attendanceId = existingAttendance?.id || `${classId}_${currentDate}`;

    const baseAttendance = existingAttendance || {
      date: currentDate,
      classId: classId,
      absents: [],
    };

    // Strip any undefined values to avoid Firebase sync errors
    const newAttendance = JSON.parse(
      JSON.stringify({
        ...baseAttendance,
        id: attendanceId,
        isDone: true,
        completedAt: now,
      })
    );

    // Optimistic state update (if you want immediate local reflection)
    setAttendances((prev) => {
      const idx = prev.findIndex(
        (a) => a.classId === classId && a.date === currentDate
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newAttendance;
        return next;
      }
      return [...prev, newAttendance];
    });

    if (!schoolUid) return;
    setDoc(
      doc(db, "schools", schoolUid, "attendances", attendanceId),
      newAttendance
    ).catch((error) => {
      console.error("Erreur validation:", error);
      toast.error("Erreur lors de la validation", {
        description: String(error),
      });
    });

    const absentCount = newAttendance.absents.length || 0;

    toast.success("Appel validé et synchronisé !", {
      id: "attendance-toast",
      description: `${absentCount} absent(s) signalé(s).`,
      style: {
        background: "#43A047",
        color: "white",
        border: "none",
      },
    });

    setSelectedClassId(null);
  };

  const handleAddStudents = async (newStudents: Student[]) => {
    if (!schoolUid) return;
    try {
      const batch = writeBatch(db);
      newStudents.forEach((student) => {
        const studentRef = doc(
          db,
          "schools",
          schoolUid,
          "students",
          student.id
        );
        batch.set(studentRef, student);
      });
      await batch.commit();
      toast.success("Élèves ajoutés avec succès");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!schoolUid) return;
    try {
      await deleteDoc(doc(db, "schools", schoolUid, "students", studentId));
      toast.success("Élève supprimé");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getUncompletedCount = () => {
    let missedDays = 0;

    let startDateStr = getLocalYMD();

    if (attendances.length > 0) {
      const earliestAttendance = attendances.reduce(
        (min, cur) => (new Date(cur.date) < new Date(min) ? cur.date : min),
        attendances[0].date
      );
      if (new Date(earliestAttendance) < new Date(startDateStr)) {
        startDateStr = earliestAttendance;
      }
    }

    const today = new Date();
    // Exclude today if it's before 10:00 AM (because the alert hasn't triggered yet)
    if (today.getHours() < 10) {
      today.setDate(today.getDate() - 1);
    }
    today.setHours(23, 59, 59, 999);

    let d = new Date(startDateStr);
    d.setHours(0, 0, 0, 0);

    let failsafe = 0;
    while (d <= today && failsafe < 365) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // skip weekends
        const dateStr = getLocalYMD(d);
        const completedCount = attendances.filter(
          (a) => a.date === dateStr && a.isDone
        ).length;
        if (completedCount < classes.length) {
          missedDays++;
        }
      }
      d.setDate(d.getDate() + 1);
      failsafe++;
    }
    return missedDays;
  };

  const uncompletedCount = getUncompletedCount();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem("app_portal_role", selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem("app_portal_role");
    localStorage.removeItem("app_active_tab");
    localStorage.removeItem("app_selected_class");
    setSelectedClassId(null);
    setActiveTab("home");
  };

  const handleAppLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    }
    setIsAuthenticated(false);
    localStorage.removeItem("app_authenticated");
    setRole(null);
    localStorage.removeItem("app_portal_role");
    localStorage.removeItem("app_active_tab");
    localStorage.removeItem("app_selected_class");
    setSelectedClassId(null);
    setActiveTab("home");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#1A73E8] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={() => {
          setIsAuthenticated(true);
          localStorage.setItem("app_authenticated", "true");
        }}
      />
    );
  }

  if (!role) {
    return <PortalSelect onSelectRole={handleRoleSelect} />;
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-100"
      } text-gray-900 dark:text-gray-100 font-sans selection:bg-[#1A73E8] selection:text-white overflow-hidden flex flex-col`}
    >
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        role={role}
        onLogout={handleLogout}
        onAppLogout={handleAppLogout}
      />

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedClassId ? (
            <motion.div
              key="class"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full absolute top-0 left-0 bg-gray-50 dark:bg-gray-900 flex flex-col z-30"
            >
              <ClassAttendance
                classData={classes.find((c) => c.id === selectedClassId)!}
                students={students.filter((s) => s.classId === selectedClassId)}
                absents={currentAttendance.absents}
                attendances={attendances}
                onBack={handleBackToDashboard}
                onUpdateStatus={handleUpdateStudentStatus}
                onValidate={handleValidateClass}
                role={role}
              />
            </motion.div>
          ) : (
            <motion.div
              key="main-tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full absolute top-0 left-0 bg-gray-50 dark:bg-gray-900 flex flex-col"
            >
              <div className="flex-1 overflow-hidden relative">
                {activeTab === "home" && (
                  <Dashboard
                    classes={classes}
                    students={students}
                    attendances={attendances}
                    currentDate={currentDate}
                    onDateChange={handleDateChange}
                    onSelectClass={handleSelectClass}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    filter={filter}
                    setFilter={setFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    role={role}
                  />
                )}
                {activeTab === "students" && (
                  <DataManagement
                    classes={classes}
                    students={students}
                    onAddStudents={handleAddStudents}
                    onDeleteStudent={handleDeleteStudent}
                    role={role}
                  />
                )}
                {activeTab === "reports" && (
                  <GlobalReport
                    currentDate={currentDate}
                    attendances={attendances}
                    classes={classes}
                    students={students}
                  />
                )}
                {activeTab === "notifications" && (
                  <Notifications
                    classes={classes}
                    attendances={attendances}
                    onDateChange={handleDateChange}
                    onClose={() => setActiveTab("home")}
                  />
                )}
              </div>

              {/* Bottom Navigation Navbar */}
              <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 shadow-[0_-8px_16px_-1px_rgba(0,0,0,0.03)] w-full">
                <div className="flex justify-around items-center h-[64px] max-w-md mx-auto px-2">
                  <button
                    onClick={() => setActiveTab("home")}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                      activeTab === "home"
                        ? "text-[#1A73E8] dark:text-[#3B82F6]"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        activeTab === "home"
                          ? "bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]"
                          : ""
                      }`}
                    >
                      <Home
                        strokeWidth={activeTab === "home" ? 2.5 : 2}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                      Accueil
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("students")}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                      activeTab === "students"
                        ? "text-[#1A73E8] dark:text-[#3B82F6]"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        activeTab === "students"
                          ? "bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]"
                          : ""
                      }`}
                    >
                      <Users
                        strokeWidth={activeTab === "students" ? 2.5 : 2}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                      Élèves
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                      activeTab === "reports"
                        ? "text-[#1A73E8] dark:text-[#3B82F6]"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        activeTab === "reports"
                          ? "bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]"
                          : ""
                      }`}
                    >
                      <FileBarChart
                        strokeWidth={activeTab === "reports" ? 2.5 : 2}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                      Rapports
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
                      activeTab === "notifications"
                        ? "text-[#1A73E8] dark:text-[#3B82F6]"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        activeTab === "notifications"
                          ? "bg-blue-50/80 dark:bg-blue-900/30 translate-y-[-2px]"
                          : ""
                      } relative`}
                    >
                      <Bell
                        strokeWidth={activeTab === "notifications" ? 2.5 : 2}
                        className="w-5 h-5"
                      />
                      {uncompletedCount > 0 && (
                        <span className="absolute 1 top-1.5 right-1.5 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-900">
                          {uncompletedCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                      Alertes
                    </span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toaster position="top-center" theme={isDarkMode ? "dark" : "light"} visibleToasts={1} />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Student, Attendance } from "@/types";
import { CalendarDays } from "lucide-react";
import {
  fetchStudents as getStudents,
  fetchAttendanceByMonth,
  upsertAttendanceDay,
} from "@/lib/queries";
import { toast } from "sonner";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const NON_CLASS_BG = "linear-gradient(to bottom right, transparent calc(50% - 0.5px), hsl(var(--muted-foreground) / 0.3) calc(50% - 0.5px), hsl(var(--muted-foreground) / 0.3) calc(50% + 0.5px), transparent calc(50% + 0.5px))";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year] = useState(new Date().getFullYear());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        getStudents(),
        fetchAttendanceByMonth(month, year),
      ]);
      setStudents(s);
      const map: Record<string, Attendance> = {};
      a.forEach((rec) => { map[rec.student_id] = rec; });
      setAttendanceMap(map);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const monthIndex = MONTHS.indexOf(month);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  function getDayOfWeek(day: number): number {
    return new Date(year, monthIndex, day).getDay();
  }

  function isClassDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    return dow === 2 || dow === 4;
  }

  const classDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(isClassDay);

  function getDayValue(studentId: string, day: number): string | null {
    const rec = attendanceMap[studentId];
    if (!rec) return null;
    return (rec as unknown as Record<string, unknown>)[`day_${day}`] as string | null ?? null;
  }

  async function toggleDay(studentId: string, day: number) {
    const current = getDayValue(studentId, day);
    const newValue = current === null ? "I" : current === "I" ? "P" : null;
    const key = `${studentId}-${day}`;
    setSaving(key);

    setAttendanceMap((prev) => {
      const copy = { ...prev };
      const rec = copy[studentId]
        ? { ...copy[studentId] }
        : {
            id: "", student_id: studentId, month, year,
            day_1: null, day_2: null, day_3: null, day_4: null, day_5: null,
            day_6: null, day_7: null, day_8: null, day_9: null, day_10: null,
            day_11: null, day_12: null, day_13: null, day_14: null, day_15: null,
            day_16: null, day_17: null, day_18: null, day_19: null, day_20: null,
            day_21: null, day_22: null, day_23: null, day_24: null, day_25: null,
            day_26: null, day_27: null, day_28: null, day_29: null, day_30: null,
            day_31: null, total_attendances: 0, total_absences: 0, late_arrivals: 0,
            monthly_accumulated: null, created_at: "", updated_at: "",
          };
      (rec as Record<string, unknown>)[`day_${day}`] = newValue;

      let absences = 0;
      let attendances = 0;
      for (let d = 1; d <= 31; d++) {
        const v = (rec as Record<string, unknown>)[`day_${d}`] as string | null;
        if (v === "I") absences++;
        else if (v === "P") attendances++;
      }
      rec.total_absences = absences;
      rec.total_attendances = attendances;
      copy[studentId] = rec;
      return copy;
    });

    try {
      await upsertAttendanceDay(studentId, month, year, day, newValue);
    } catch {
      toast.error("Error al guardar asistencia");
      loadData();
    } finally {
      setSaving(null);
    }
  }

  function getStudentAbsences(studentId: string): number {
    const rec = attendanceMap[studentId];
    if (!rec) return 0;
    let count = 0;
    for (const d of classDays) {
      if ((rec as unknown as Record<string, unknown>)[`day_${d}`] === "I") count++;
    }
    return count;
  }

  function getStudentAttendances(studentId: string): number {
    const rec = attendanceMap[studentId];
    if (!rec) return 0;
    let count = 0;
    for (const d of classDays) {
      if ((rec as unknown as Record<string, unknown>)[`day_${d}`] === "P") count++;
    }
    return count;
  }

  const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asistencia</h1>
          <p className="text-muted-foreground">
            Registro de asistencia diaria de alumnos.
          </p>
        </div>
        <Select value={month} onValueChange={(v) => v && setMonth(v)}>
          <SelectTrigger className="w-[180px]">
            <CalendarDays className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m} {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {month} {year} — {classDays.length} días de clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2 min-w-[40px] sticky left-0 bg-card z-10 border-r">N°</th>
                    <th className="text-left font-medium p-2 min-w-[160px] sm:min-w-[200px] sticky left-[40px] bg-card z-10 border-r">
                      Apellido y Nombre
                    </th>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dow = getDayOfWeek(day);
                      return (
                        <th
                          key={i}
                          className={`text-center font-medium p-1 w-8 text-xs ${
                            isClassDay(day)
                              ? "text-foreground"
                              : "text-muted-foreground/40 bg-muted/30"
                          }`}
                              style={!isClassDay(day) ? { backgroundImage: NON_CLASS_BG } : undefined}
                        >
                          {day}
                          <span className="block text-[9px] leading-tight">{DAY_LABELS[dow]}</span>
                        </th>
                      );
                    })}
                    <th className="text-center font-medium p-2 min-w-[80px] border-l">
                      Días de Clase
                    </th>
                    <th className="text-center font-medium p-2 min-w-[80px]">
                      Asist.
                    </th>
                    <th className="text-center font-medium p-2 min-w-[80px]">
                      Inasist.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const absences = getStudentAbsences(s.id);
                    const attendances = getStudentAttendances(s.id);
                    return (
                      <tr key={s.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 sticky left-0 bg-card z-10 border-r">{s.order_number}</td>
                        <td className="p-2 font-medium sticky left-[40px] bg-card z-10 border-r whitespace-nowrap">{s.full_name}</td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const val = getDayValue(s.id, day);
                          const isAbsent = val === "I";
                          const isPresent = val === "P";
                          const busy = saving === `${s.id}-${day}`;
                          return (
                            <td
                              key={i}
                              className={`p-1 text-center select-none ${
                                isClassDay(day)
                                  ? isAbsent
                                    ? "text-red-600 font-bold cursor-pointer"
                                    : isPresent
                                      ? "text-green-600 font-bold cursor-pointer"
                                      : "text-muted-foreground cursor-pointer"
                                  : "text-muted-foreground/30 bg-muted/30"
                              } ${busy ? "opacity-50" : ""}`}
                          style={!isClassDay(day) ? { backgroundImage: NON_CLASS_BG } : undefined}
                              onClick={() => isClassDay(day) && toggleDay(s.id, day)}
                            >
                              {isClassDay(day) ? (
                                isAbsent ? "I" : isPresent ? "P" : "—"
                              ) : (
                                <span className="invisible">{day}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-medium border-l">
                          {classDays.length}
                        </td>
                        <td className="p-2 text-center font-medium text-green-600">
                          {attendances}
                        </td>
                        <td className={`p-2 text-center font-medium ${absences > 0 ? "text-red-600" : ""}`}>
                          {absences}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {students.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No hay alumnos registrados.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3 sm:hidden">
              Deslizá hacia la derecha para ver los días
            </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

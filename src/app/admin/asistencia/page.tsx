"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
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
  fetchAttendanceMeta,
  saveAttendanceMeta,
  upsertAttendanceDay,
} from "@/lib/queries";
import { toast } from "sonner";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const NON_CLASS_BG = "linear-gradient(to right, transparent calc(50% - 1px), hsl(var(--muted-foreground) / 0.35) 50%, transparent calc(50% + 1px))";

const ATTENDANCE_STATES: { value: string | null; label: string; className: string }[] = [
  { value: null, label: "Presente", className: "text-muted-foreground" },
  { value: "I", label: "Ausente", className: "text-red-600 font-bold" },
  { value: "Paro", label: "Paro", className: "text-orange-600 font-bold" },
  { value: "Lic.", label: "Licencia", className: "text-blue-600 font-bold" },
  { value: "Cap.", label: "Capacitación", className: "text-violet-600 font-bold" },
  { value: "Fer.", label: "Feriado", className: "text-emerald-600 font-bold" },
];

const ATTENDANCE_CYCLE = [null, "I", "Paro", "Lic.", "Cap.", "Fer."];

function isPresentValue(v: string | null | undefined): boolean {
  return v == null || v === "" || v === "P";
}

const COLLECTIVE_CODES = ["Paro", "Lic.", "Cap.", "Fer."];

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(0);
  const [extraNoClass, setExtraNoClass] = useState<number[]>([]);
  const [savingMeta, setSavingMeta] = useState(false);

  useEffect(() => {
    const now = new Date();
    setMonth(MONTHS[now.getMonth()]);
    setYear(now.getFullYear());
  }, []);

  const loadData = useCallback(async () => {
    if (!month || !year) return;
    setLoading(true);
    try {
      const [s, a, meta] = await Promise.all([
        getStudents(),
        fetchAttendanceByMonth(month, year),
        fetchAttendanceMeta(month, year),
      ]);
      setStudents(s);
      const map: Record<string, Attendance> = {};
      a.forEach((rec) => { map[rec.student_id] = rec; });
      setAttendanceMap(map);
      setExtraNoClass(meta ? meta.split(",").map((n) => Number(n)).filter((n) => n > 0) : []);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const monthIndex = MONTHS.indexOf(month);
  const daysInMonth = monthIndex < 0 ? 0 : new Date(year, monthIndex + 1, 0).getDate();

  function getDayOfWeek(day: number): number {
    return new Date(year, monthIndex, day).getDay();
  }

  function isClassDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    return dow === 2 || dow === 4;
  }

  const allClassDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(isClassDay);
  const classDays = allClassDays.filter(
    (d) => !extraNoClass.includes(d) && !getDayCollectiveCode(d),
  );

  function isSuspended(day: number): boolean {
    return !isClassDay(day) || extraNoClass.includes(day);
  }

  async function toggleManualNoClass(day: number) {
    if (!isClassDay(day)) return;
    setSavingMeta(true);
    const next = extraNoClass.includes(day)
      ? extraNoClass.filter((d) => d !== day)
      : [...extraNoClass, day].sort((a, b) => a - b);
    setExtraNoClass(next);
    try {
      await saveAttendanceMeta(month, year, next);
    } catch {
      toast.error("Error al guardar el día sin clases");
    } finally {
      setSavingMeta(false);
    }
  }

  function getDayValue(studentId: string, day: number): string | null {
    const rec = attendanceMap[studentId];
    if (!rec) return null;
    return (rec as unknown as Record<string, unknown>)[`day_${day}`] as string | null ?? null;
  }

  function getDayCollectiveCode(day: number): string | null {
    for (const s of students) {
      const v = getDayValue(s.id, day);
      if (v && COLLECTIVE_CODES.includes(v)) return v;
    }
    return null;
  }

  function emptyRec(studentId: string) {
    return {
      id: "", student_id: studentId, month, year,
      day_1: null, day_2: null, day_3: null, day_4: null, day_5: null,
      day_6: null, day_7: null, day_8: null, day_9: null, day_10: null,
      day_11: null, day_12: null, day_13: null, day_14: null, day_15: null,
      day_16: null, day_17: null, day_18: null, day_19: null, day_20: null,
      day_21: null, day_22: null, day_23: null, day_24: null, day_25: null,
      day_26: null, day_27: null, day_28: null, day_29: null, day_30: null,
      day_31: null, total_attendances: 0, total_absences: 0, late_arrivals: 0,
      monthly_accumulated: null, created_at: "", updated_at: "",
    } as Attendance;
  }

  function recomputeTotals(rec: Record<string, unknown>) {
    let absences = 0;
    let attendances = 0;
    for (let d = 1; d <= 31; d++) {
      const v = rec[`day_${d}`] as string | null;
      if (v === "I") absences++;
      else if (isPresentValue(v)) attendances++;
    }
    rec.total_absences = absences;
    rec.total_attendances = attendances;
  }

  async function applyDayToAll(day: number, code: string | null) {
    if (students.length === 0) return;
    setSaving(`all-${day}`);
    setAttendanceMap((prev) => {
      const copy = { ...prev };
      for (const s of students) {
        const rec = copy[s.id] ? { ...copy[s.id] } : emptyRec(s.id);
        (rec as Record<string, unknown>)[`day_${day}`] = code;
        recomputeTotals(rec as Record<string, unknown>);
        copy[s.id] = rec;
      }
      return copy;
    });
    try {
      await Promise.all(
        students.map((s) => upsertAttendanceDay(s.id, month, year, day, code)),
      );
    } catch {
      toast.error("Error al guardar asistencia");
      loadData();
    } finally {
      setSaving(null);
    }
  }

  async function toggleDay(studentId: string, day: number) {
    if (isSuspended(day)) return;
    const current = getDayValue(studentId, day);
    const normalized = isPresentValue(current) ? null : current;
    const idx = ATTENDANCE_CYCLE.indexOf(
      normalized as (typeof ATTENDANCE_CYCLE)[number],
    );
    const newValue =
      ATTENDANCE_CYCLE[(idx + 1) % ATTENDANCE_CYCLE.length] as string | null;
    const isCollectiveDay = !!current && COLLECTIVE_CODES.includes(current);

    if (isCollectiveDay || (newValue && COLLECTIVE_CODES.includes(newValue))) {
      applyDayToAll(day, newValue);
      return;
    }

    const key = `${studentId}-${day}`;
    setSaving(key);

    setAttendanceMap((prev) => {
      const copy = { ...prev };
      const rec = copy[studentId] ? { ...copy[studentId] } : emptyRec(studentId);
      (rec as Record<string, unknown>)[`day_${day}`] = newValue;
      recomputeTotals(rec as Record<string, unknown>);
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
      if (isPresentValue((rec as unknown as Record<string, unknown>)[`day_${d}`] as string | null)) count++;
    }
    return count;
  }

  function getDayCounts(day: number) {
    let presentes = 0;
    let ausentes = 0;
    for (const s of students) {
      const v = getDayValue(s.id, day);
      if (v === "I") ausentes++;
      else if (isPresentValue(v)) presentes++;
    }
    return { presentes, ausentes };
  }

  const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asistencia</h1>
          <p className="text-muted-foreground">
            Registro de asistencia diaria de alumnos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
            {classDays.length} días de clase
          </span>
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
      </div>
      <Card>
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
                    <th className="text-left font-medium p-2 min-w-[40px] bg-card border-r">N°</th>
                    <th className="text-left font-medium p-2 min-w-[160px] sm:min-w-[200px] bg-card border-r">
                      Apellido y Nombre
                    </th>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dow = getDayOfWeek(day);
                      const suspended = isSuspended(day);
                      return (
                        <th
                          key={i}
                          onClick={() => toggleManualNoClass(day)}
                          title={
                            isClassDay(day)
                              ? "Clic para marcar/desmarcar día sin clases"
                              : undefined
                          }
                          className={`text-center font-medium p-1 w-8 text-xs ${
                            suspended
                              ? "text-foreground/70 bg-muted/30"
                              : "text-foreground"
                          } ${isClassDay(day) ? "cursor-pointer" : "cursor-default"} ${
                            savingMeta ? "opacity-60" : ""
                          }`}
                          style={
                            suspended
                              ? { backgroundImage: NON_CLASS_BG }
                              : undefined
                          }
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
                        <td className="p-2 bg-card border-r">{s.order_number}</td>
                        <td className="p-2 font-medium bg-card border-r whitespace-nowrap">{s.full_name}</td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const val = getDayValue(s.id, day);
                          const suspended = isSuspended(day);
                          const code = isPresentValue(val) ? null : (val as string);
                          const state = ATTENDANCE_STATES.find((st) => st.value === code);
                          const busy = saving === `${s.id}-${day}` || saving === `all-${day}`;
                          return (
                            <td
                              key={i}
                              title={
                                suspended
                                  ? undefined
                                  : `${state?.label ?? "Presente"} — clic para cambiar`
                              }
                              className={`p-1 text-center select-none ${
                                suspended
                                  ? "text-muted-foreground/30 bg-muted/30"
                                  : code
                                    ? `${state?.className ?? "text-muted-foreground font-bold"} cursor-pointer`
                                    : "text-muted-foreground cursor-pointer"
                              } ${busy ? "opacity-50" : ""}`}
                          style={suspended ? { backgroundImage: NON_CLASS_BG } : undefined}
                              onClick={() => !suspended && toggleDay(s.id, day)}
                            >
                              {suspended ? (
                                <span className="invisible">{day}</span>
                              ) : (
                                code ?? ""
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
                <tfoot>
                  <tr className="border-t bg-muted/40">
                    <td
                      colSpan={2}
                      title="Presentes / Ausentes por día"
                      className="p-2 font-medium text-xs bg-muted/50 border-r"
                    >
                      P / A
                    </td>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const suspended = isSuspended(day);
                      const counts = getDayCounts(day);
                      return (
                        <td
                          key={i}
                          className={`p-1 text-center text-xs whitespace-nowrap ${
                            suspended
                              ? "text-muted-foreground/30 bg-muted/30"
                              : "text-muted-foreground"
                          }`}
                          style={
                            suspended
                              ? { backgroundImage: NON_CLASS_BG }
                              : undefined
                          }
                        >
{suspended
                          ? ""
                          : getDayCollectiveCode(day) ??
                            `${counts.presentes}/${counts.ausentes}`}
                        </td>
                      );
                    })}
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
              {students.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No hay alumnos registrados.
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>(vacío) Presente</span>
              <span className="text-red-600 font-semibold">I — Ausente</span>
              <span className="text-orange-600 font-semibold">Paro</span>
              <span className="text-blue-600 font-semibold">Lic. — Licencia</span>
              <span className="text-violet-600 font-semibold">Cap. — Capacitación</span>
              <span className="text-emerald-600 font-semibold">Fer. — Feriado</span>
              <span>Clic cicla: vacío → I → Paro → Lic. → Cap. → Fer. → vuelve a vacío (lo limpia) · Paro, Lic., Cap. y Fer. se aplican a todos y no cuentan como día de clase · clic en el <b>número del día</b> lo marca sin clases (rayado) y otro clic lo desmarca · renglón P/A: presentes/ausentes por día</span>
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

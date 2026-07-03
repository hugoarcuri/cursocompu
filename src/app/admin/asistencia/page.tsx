"use client";

import { useEffect, useState } from "react";
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
import { Student } from "@/types";
import { CalendarDays } from "lucide-react";
import { fetchStudents as getStudents } from "@/lib/queries";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthIndex = MONTHS.indexOf(month);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  function getDayOfWeek(day: number): number {
    return new Date(year, monthIndex, day).getDay();
  }

  function isClassDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    return dow === 2 || dow === 4;
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
            {month} {year} — {daysInMonth} días
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2 min-w-[40px]">N°</th>
                    <th className="text-left font-medium p-2 min-w-[200px]">
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
                              : "text-muted-foreground/30 line-through"
                          }`}
                        >
                          {day}
                          <span className="block text-[9px] leading-tight">{DAY_LABELS[dow]}</span>
                        </th>
                      );
                    })}
                    <th className="text-center font-medium p-2 min-w-[80px]">
                      Asist.
                    </th>
                    <th className="text-center font-medium p-2 min-w-[80px]">
                      Inasist.
                    </th>
                    <th className="text-center font-medium p-2 min-w-[80px]">
                      Tarde
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{s.order_number}</td>
                      <td className="p-2 font-medium">{s.full_name}</td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        return (
                          <td
                            key={i}
                            className={`p-1 text-center ${
                              isClassDay(day)
                                ? "text-muted-foreground cursor-pointer"
                                : "text-muted-foreground/20 bg-muted/30 relative"
                            }`}
                          >
                            {isClassDay(day) ? (
                              "—"
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-px h-full bg-muted-foreground/20 rotate-0" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center text-green-600 font-medium">
                        0
                      </td>
                      <td className="p-2 text-center text-red-600 font-medium">
                        0
                      </td>
                      <td className="p-2 text-center text-orange-600 font-medium">
                        0
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No hay alumnos registrados.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

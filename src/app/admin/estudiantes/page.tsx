"use client";

import { useEffect, useState, useCallback } from "react";
import { StudentsTable } from "@/components/students-table";
import { ExportButton } from "@/components/export-button";
import { Student } from "@/types";
import { fetchStudents as getStudents, batchUpdateAgeRange } from "@/lib/queries";
import { calcAgeRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceDate, setReferenceDate] = useState("");
  const [recalculating, setRecalculating] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  async function handleRecalculate() {
    if (!referenceDate) {
      toast.error("Seleccioná una fecha de referencia");
      return;
    }
    setRecalculating(true);
    try {
      const updates = students
        .map((s) => ({
          id: s.id,
          age_range: calcAgeRange(s.birth_day, s.birth_month, s.birth_year, referenceDate),
        }))
        .filter((u) => u.age_range !== null);
      await batchUpdateAgeRange(updates);
      toast.success(`Edades recalculadas para ${updates.length} alumnos`);
      fetchStudents();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al recalcular edades");
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">
            Gestión del registro de alumnos adultos.
          </p>
        </div>
        <ExportButton students={students} />
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="ref-date">Fecha de Referencia</Label>
          <Input
            id="ref-date"
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
          />
        </div>
        <Button onClick={handleRecalculate} disabled={recalculating}>
          {recalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Recalcular Edades
        </Button>
      </div>
      <StudentsTable
        students={students}
        isLoading={loading}
        onRefresh={fetchStudents}
      />
    </div>
  );
}

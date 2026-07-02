"use client";

import { useEffect, useState, useCallback } from "react";
import { StudentsTable } from "@/components/students-table";
import { ExportButton } from "@/components/export-button";
import { Student } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
      <StudentsTable
        students={students}
        isLoading={loading}
        onRefresh={fetchStudents}
      />
    </div>
  );
}

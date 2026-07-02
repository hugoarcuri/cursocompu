"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileCode } from "lucide-react";
import { Student } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import Papa from "papaparse";

interface ExportButtonProps {
  students: Student[];
}

export function ExportButton({ students }: ExportButtonProps) {
  function formatDate(s: Student): string {
    if (s.birth_day && s.birth_month && s.birth_year) {
      return `${s.birth_day}/${s.birth_month}/${s.birth_year}`;
    }
    return "--";
  }

  const exportData = students.map((s) => ({
    "#": s.order_number,
    "Apellido y Nombre": s.full_name,
    "N° Inscripción": s.inscription_number ?? "",
    "Fecha de Nacimiento": formatDate(s),
    Nacionalidad: s.nationality ?? "",
    Sexo: s.sex === "M" ? "Masculino" : s.sex === "F" ? "Femenino" : "",
    "Fecha Ingreso": s.admission_date ?? "",
    "Fecha Egreso": s.exit_date ?? "",
    "Causas del Egreso": s.exit_reason ?? "",
    Edad: s.age_range ?? "",
    Domicilio: s.address ?? "",
    Teléfono: s.phone ?? "",
  }));

  function exportExcel() {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
      XLSX.writeFile(wb, `alumnos_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel exportado correctamente");
    } catch {
      toast.error("Error al exportar Excel");
    }
  }

  function exportPDF() {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Registro de Alumnos", 14, 20);
      doc.setFontSize(10);
      doc.text(`Exportado: ${new Date().toLocaleDateString("es-AR")}`, 14, 28);

      const headers = Object.keys(exportData[0] ?? {});
      const rows = exportData.map((row) => Object.values(row));

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 34,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246] as unknown as string },
      });

      doc.save(`alumnos_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado correctamente");
    } catch {
      toast.error("Error al exportar PDF");
    }
  }

  function exportCSV() {
    try {
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alumnos_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exportado correctamente");
    } catch {
      toast.error("Error al exportar CSV");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" disabled={students.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          Exportar a PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV}>
          <FileCode className="mr-2 h-4 w-4 text-blue-600" />
          Exportar a CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

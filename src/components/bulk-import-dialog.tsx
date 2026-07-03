"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { createStudent } from "@/lib/queries";
import { toast } from "sonner";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ParsedStudent {
  order_number: number;
  full_name: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  nationality: string;
  sex: "M" | "F" | null;
  address: string;
  phone: string;
}

function parseRows(text: string): ParsedStudent[] {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  const students: ParsedStudent[] = [];

  for (const line of lines) {
    const cols = line.split("\t").map((c) => c.trim());
    if (cols.length < 2 || !cols[1]) continue;

    const orderNumber = parseInt(cols[0], 10);
    if (isNaN(orderNumber)) continue;

    const fullName = cols[1] || "";
    if (!fullName) continue;

    const birthDay = cols[2] ? parseInt(cols[2], 10) : null;
    const birthMonth = cols[3] ? parseInt(cols[3], 10) : null;
    const birthYear = cols[4] ? parseInt(cols[4], 10) : null;
    const nationality = cols[5] || "";
    const sexRaw = (cols[6] || "").toUpperCase();
    const sex: "M" | "F" | null =
      sexRaw === "M" || sexRaw === "MASCULINO"
        ? "M"
        : sexRaw === "F" || sexRaw === "FEMENINO"
          ? "F"
          : null;
    const address = cols[7] || "";
    const phone = cols[8] || "";

    students.push({
      order_number: orderNumber,
      full_name: fullName,
      birth_day: isNaN(birthDay as number) ? null : birthDay,
      birth_month: isNaN(birthMonth as number) ? null : birthMonth,
      birth_year: isNaN(birthYear as number) ? null : birthYear,
      nationality,
      sex,
      address,
      phone,
    });
  }

  return students;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImported,
}: BulkImportDialogProps) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);

  const parsed = text.trim() ? parseRows(text) : [];

  async function handleImport() {
    if (parsed.length === 0) {
      toast.error("No se encontraron alumnos válidos");
      return;
    }
    setImporting(true);
    setResult(null);
    let ok = 0;
    let fail = 0;

    for (const student of parsed) {
      try {
        await createStudent(student);
        ok++;
      } catch {
        fail++;
      }
    }

    setResult({ ok, fail });
    setImporting(false);
    if (ok > 0) {
      toast.success(`${ok} alumno(s) importado(s) correctamente`);
      setText("");
      onImported();
    }
    if (fail > 0) {
      toast.error(`${fail} alumno(s) no pudieron importarse`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Alumnos</DialogTitle>
          <DialogDescription>
            Pegá una lista copiada de una planilla (Excel, Google Sheets). Cada
            línea debe ser un alumno con columnas separadas por tabulaciones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="font-medium mb-1">Formato esperado (separado por tabulaciones):</p>
            <code className="text-xs break-all">
              N°&nbsp;Orden&nbsp;&nbsp;&nbsp;Apellido&nbsp;y&nbsp;Nombre&nbsp;&nbsp;&nbsp;Día&nbsp;&nbsp;&nbsp;Mes&nbsp;&nbsp;&nbsp;Año&nbsp;&nbsp;&nbsp;Nacionalidad&nbsp;&nbsp;&nbsp;Sexo&nbsp;&nbsp;&nbsp;Domicilio&nbsp;&nbsp;&nbsp;Teléfono
            </code>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-text">
              Pegá la lista aquí ({parsed.length} alumno{parsed.length !== 1 ? "s" : ""} detectado{parsed.length !== 1 ? "s" : ""}):
            </Label>
            <Textarea
              id="bulk-text"
              placeholder={"1\tAbraham María Eva\t12\t5\t1952\tArgentina\tF\t\t\n2\tAgüero Graciela Monica\t31\t7\t1963\tArgentina\tF\t\t"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
          </div>

          {parsed.length > 0 && (
            <div className="max-h-48 overflow-auto rounded border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left">
                    <th className="p-2">N°</th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Nac.</th>
                    <th className="p-2">Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">{s.order_number}</td>
                      <td className="p-2">{s.full_name}</td>
                      <td className="p-2">
                        {s.birth_day}/{s.birth_month}/{s.birth_year}
                      </td>
                      <td className="p-2">{s.sex ?? "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                Importados: <strong>{result.ok}</strong> | Errores:{" "}
                <strong>{result.fail}</strong>
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || parsed.length === 0}
            >
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Importar {parsed.length > 0 ? `(${parsed.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

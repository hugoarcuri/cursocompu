"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { createStudent } from "@/lib/queries";
import { toast } from "sonner";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const FIELD_OPTIONS = [
  { value: "_skip", label: "-- No importar --" },
  { value: "order_number", label: "N° Orden" },
  { value: "full_name", label: "Apellido y Nombre" },
  { value: "dni", label: "DNI" },
  { value: "birth_day", label: "Día nac." },
  { value: "birth_month", label: "Mes nac." },
  { value: "birth_year", label: "Año nac." },
  { value: "nationality", label: "Nacionalidad" },
  { value: "sex", label: "Sexo (V/M)" },
  { value: "address", label: "Domicilio" },
  { value: "phone", label: "Teléfono" },
  { value: "admission_date", label: "Fecha Ingreso" },
];

function parseWithMapping(lines: string[], mapping: string[]): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  for (const line of lines) {
    const cols = line.split("\t").map((c) => c.trim());
    const row: Record<string, unknown> = {};
    let hasName = false;

    for (let i = 0; i < mapping.length; i++) {
      const field = mapping[i];
      const val = cols[i] || "";
      if (field === "_skip" || !val) continue;

      if (field === "order_number") {
        const n = parseInt(val, 10);
        row[field] = isNaN(n) ? null : n;
      } else if (field === "birth_day" || field === "birth_month" || field === "birth_year") {
        const n = parseInt(val, 10);
        row[field] = isNaN(n) ? null : n;
      } else if (field === "sex") {
        const up = val.toUpperCase();
        if (up === "V" || up === "VARON") row[field] = "V";
        else if (up === "M" || up === "MASCULINO") row[field] = "M";
        else row[field] = null;
      } else {
        row[field] = val;
      }

      if (field === "full_name" && val) hasName = true;
    }

    if (hasName) results.push(row);
  }

  return results;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImported,
}: BulkImportDialogProps) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);
  const [mapping, setMapping] = useState<string[]>([
    "order_number",
    "full_name",
    "_skip",
    "_skip",
    "_skip",
    "nationality",
    "sex",
    "_skip",
    "phone",
  ]);

  const lines = useMemo(
    () => text.trim().split("\n").filter((l) => l.trim()),
    [text],
  );

  const parsed = useMemo(() => {
    if (lines.length === 0 || mapping.every((m) => m === "_skip")) return [];
    return parseWithMapping(lines, mapping);
  }, [lines, mapping]);

  const detectedCols = useMemo(() => {
    if (lines.length === 0) return 0;
    return lines[0].split("\t").length;
  }, [lines]);

  function updateMapping(colIndex: number, value: string) {
    setMapping((prev) => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
  }

  function autoDetectMapping() {
    if (detectedCols === 0) return;
    const auto: string[] = [];
    for (let i = 0; i < detectedCols; i++) {
      if (i === 0) auto.push("order_number");
      else if (i === 1) auto.push("full_name");
      else if (i === 2) auto.push("birth_day");
      else if (i === 3) auto.push("birth_month");
      else if (i === 4) auto.push("birth_year");
      else if (i === 5) auto.push("nationality");
      else if (i === 6) auto.push("sex");
      else if (i === 7) auto.push("address");
      else if (i === 8) auto.push("phone");
      else auto.push("_skip");
    }
    setMapping(auto);
  }

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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Alumnos</DialogTitle>
          <DialogDescription>
            Pegá una lista copiada de una planilla (Excel, Google Sheets). Cada
            línea es un alumno con columnas separadas por tabulaciones. Mapeá las
            columnas a los campos que desees importar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-text">Pegá la lista aquí:</Label>
            <Textarea
              id="bulk-text"
              placeholder={"1\tJuan Pérez\t12\t5\t1990\tArgentina\tV\t\t1234567"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          {detectedCols > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mapeo de columnas ({detectedCols} detectada{detectedCols > 1 ? "s" : ""})</Label>
                <Button variant="outline" size="sm" onClick={autoDetectMapping}>
                  Auto-detectar
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {Array.from({ length: detectedCols }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-xs text-muted-foreground">Col {i + 1}</span>
                    <Select
                      value={mapping[i] || "_skip"}
                      onValueChange={(v) => updateMapping(i, v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.length > 0 && (
            <div className="max-h-48 overflow-auto rounded border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left">
                    {mapping.map((m, i) =>
                      m !== "_skip" ? (
                        <th key={i} className="p-2">
                          {FIELD_OPTIONS.find((f) => f.value === m)?.label}
                        </th>
                      ) : null,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 20).map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {mapping.map((m, j) =>
                        m !== "_skip" ? (
                          <td key={j} className="p-2">
                            {String((s as any)[m] ?? "--")}
                          </td>
                        ) : null,
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 20 && (
                <p className="text-center text-xs text-muted-foreground p-2">
                  ...y {parsed.length - 20} más
                </p>
              )}
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

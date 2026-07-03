"use client";

import { useState, useMemo, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, AlertCircle, FileSpreadsheet, ClipboardList, FileDown } from "lucide-react";
import { createStudent, updateStudent } from "@/lib/queries";
import { Student } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
  students?: Student[];
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

function autoMapColumns(headers: string[]): string[] {
  return headers.map((h) => {
    const lower = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.includes("orden") || lower.includes("n°") || lower.includes("num")) return "order_number";
    if (lower.includes("nombre") || lower.includes("apellido")) return "full_name";
    if (lower.includes("dni")) return "dni";
    if (lower.includes("dia") || lower.includes("día")) return "birth_day";
    if (lower.includes("mes")) return "birth_month";
    if (lower.includes("año") || lower.includes("ano")) return "birth_year";
    if (lower.includes("nacional")) return "nationality";
    if (lower.includes("sexo") || lower.includes("sex")) return "sex";
    if (lower.includes("domicilio") || lower.includes("direccion") || lower.includes("dirección") || lower.includes("dom")) return "address";
    if (lower.includes("tel")) return "phone";
    if (lower.includes("ingreso")) return "admission_date";
    return "_skip";
  });
}

function parseWithMapping(rows: (string | number | null)[][], mapping: string[]): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  for (const row of rows) {
    const obj: Record<string, unknown> = {};
    let hasName = false;

    for (let i = 0; i < mapping.length; i++) {
      const field = mapping[i];
      const val = row[i] != null ? String(row[i]).trim() : "";
      if (field === "_skip" || !val) continue;

      if (field === "order_number") {
        const n = parseInt(val, 10);
        obj[field] = isNaN(n) ? null : n;
      } else if (field === "birth_day" || field === "birth_month" || field === "birth_year") {
        const n = parseInt(val, 10);
        obj[field] = isNaN(n) ? null : n;
      } else if (field === "sex") {
        const up = val.toUpperCase();
        if (up === "V" || up === "VARON") obj[field] = "V";
        else if (up === "M" || up === "MASCULINO" || up === "F" || up === "FEMENINO") obj[field] = "M";
        else obj[field] = null;
      } else {
        obj[field] = val;
      }

      if (field === "full_name" && val) hasName = true;
    }

    if (hasName) results.push(obj);
  }

  return results;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImported,
  students = [],
}: BulkImportDialogProps) {
  const [tab, setTab] = useState("paste");
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);
  const [mapping, setMapping] = useState<string[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<(string | number | null)[][]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    if (rawRows.length === 0 || mapping.length === 0 || mapping.every((m) => m === "_skip")) return [];
    return parseWithMapping(rawRows, mapping);
  }, [rawRows, mapping]);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setResult(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });

      if (json.length === 0) {
        toast.error("El archivo está vacío");
        return;
      }

      const firstRow = json[0];
      const isHeader = firstRow.some((c) => c && typeof c === "string" && /[a-zA-Záéíóú]/.test(String(c)));

      const hdrs = isHeader ? firstRow.map((c) => String(c ?? "")) : firstRow.map((_, i) => `Col ${i + 1}`);
      const rows = isHeader ? json.slice(1) : json;

      setHeaders(hdrs);
      setRawRows(rows);
      setMapping(autoMapColumns(hdrs));
      toast.success(`${rows.length} fila(s) detectada(s)`);
    } catch {
      toast.error("Error al leer el archivo");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  function handlePaste() {
    if (!text.trim()) return;
    const lines = text.trim().split("\n").filter((l) => l.trim());
    const rows = lines.map((l) => l.split("\t").map((c) => c.trim()));
    if (rows.length === 0) return;

    const maxCols = Math.max(...rows.map((r) => r.length));
    const hdrs = Array.from({ length: maxCols }).map((_, i) => {
      if (i === 0) return "N° Orden";
      if (i === 1) return "Apellido y Nombre";
      return `Col ${i + 1}`;
    });

    setHeaders(hdrs);
    setRawRows(rows);
    setMapping(autoMapColumns(hdrs));
    setTab("map");
  }

  function updateMapping(colIndex: number, value: string) {
    setMapping((prev) => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
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
    let updated = 0;

    const existingByName = new Map(
      students.map((s) => [s.full_name.toLowerCase().trim(), s])
    );

    for (const student of parsed) {
      try {
        const name = (student.full_name as string)?.toLowerCase().trim();
        const existing = name ? existingByName.get(name) : undefined;

        if (existing) {
          const patch: Record<string, unknown> = {};
          const fields = ["order_number", "dni", "birth_day", "birth_month", "birth_year", "nationality", "sex", "address", "phone", "admission_date"];
          for (const f of fields) {
            const newVal = (student as any)[f];
            const existingVal = (existing as any)[f];
            if (newVal != null && newVal !== "" && (existingVal == null || existingVal === "")) {
              patch[f] = newVal;
            }
          }
          if (Object.keys(patch).length > 0) {
            await updateStudent(existing.id, patch);
            updated++;
          }
          ok++;
        } else {
          await createStudent(student);
          ok++;
        }
      } catch {
        fail++;
      }
    }

    setResult({ ok, fail });
    setImporting(false);
    if (ok > 0) {
      const parts = [`${ok} alumno(s) importado(s)`];
      if (updated > 0) parts.push(`${updated} actualizado(s)`);
      toast.success(parts.join(" — "));
      setText("");
      setRawRows([]);
      setHeaders([]);
      setMapping([]);
      setFileName("");
      onImported();
    }
    if (fail > 0) {
      toast.error(`${fail} alumno(s) no pudieron importarse`);
    }
  }

  function handleReset() {
    setText("");
    setRawRows([]);
    setHeaders([]);
    setMapping([]);
    setFileName("");
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Alumnos</DialogTitle>
          <DialogDescription>
            Importá datos desde un archivo Excel, CSV o pegando una lista.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v === "paste") handleReset(); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="excel" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel / CSV
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Pegar Lista
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <FileDown className="h-4 w-4" />
              Plantilla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="excel" className="space-y-4 mt-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-accent/50"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Arrastrá un archivo aquí</p>
                <p className="text-sm text-muted-foreground">
                  o hacé clic para seleccionar
                </p>
              </div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Seleccionar archivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.tsv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
              <p className="text-xs text-muted-foreground">
                Formatos: .xlsx, .xls, .csv, .tsv
              </p>
            </div>
            {fileName && (
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="font-medium">{fileName}</span>
                <span className="text-muted-foreground">— {rawRows.length} fila(s)</span>
                <Button variant="ghost" size="sm" onClick={handleReset}>Quitar</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Pegá una lista copiada de Excel o Google Sheets:</Label>
              <Textarea
                placeholder={"1\tJuan Pérez\t12\t5\t1990\tArgentina\tV\tAv. Siempreviva 123\t1234567"}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Cada línea es un alumno. Las columnas se separan con tabulaciones (copiar desde Excel/Sheets).
              </p>
            </div>
            <Button onClick={handlePaste} disabled={!text.trim()}>
              Detectar columnas
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-4 mt-4">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Descargá la plantilla vacía:</p>
              <p className="text-sm text-muted-foreground">
                Abrila en Excel, completá los datos y subila en la pestaña "Excel / CSV".
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const wb = XLSX.utils.book_new();
                  const ws = XLSX.utils.aoa_to_sheet([
                    ["N° Orden", "Apellido y Nombre", "DNI", "Día", "Mes", "Año", "Nacionalidad", "Sexo", "Domicilio", "Teléfono", "Fecha Ingreso"],
                  ]);
                  XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
                  XLSX.writeFile(wb, "plantilla_alumnos.xlsx");
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Descargar plantilla
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {rawRows.length > 0 && mapping.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label>Mapeo de columnas</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {headers.map((h, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-xs text-muted-foreground truncate block" title={h}>
                    Col {i + 1}: {h}
                  </span>
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
          <div className="mt-4">
            <Label className="mb-2 block">Vista previa ({parsed.length} alumno{parsed.length !== 1 ? "s" : ""}):</Label>
            <div className="max-h-52 overflow-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left">
                    <th className="p-2 font-medium w-8">#</th>
                    {mapping.map((m, i) =>
                      m !== "_skip" ? (
                        <th key={i} className="p-2 font-medium">
                          {FIELD_OPTIONS.find((f) => f.value === m)?.label}
                        </th>
                      ) : null,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 20).map((s, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="p-2 text-muted-foreground">{i + 1}</td>
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
          </div>
        )}

        {result && (
          <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              Importados: <strong>{result.ok}</strong> | Errores: <strong>{result.fail}</strong>
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
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
      </DialogContent>
    </Dialog>
  );
}

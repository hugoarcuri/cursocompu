"use client";

import { useState, useCallback } from "react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Plus,
  ClipboardList,
  Trash,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table";
import { StudentDialog } from "@/components/student-dialog";
import { BulkImportDialog } from "@/components/bulk-import-dialog";
import { Student } from "@/types";
import { StudentFormValues } from "@/lib/validations";
import { toast } from "sonner";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  deleteStudents,
} from "@/lib/queries";

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function StudentsTable({
  students,
  isLoading,
  onRefresh,
}: StudentsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [admissionDateOpen, setAdmissionDateOpen] = useState(false);
  const [admissionDateValue, setAdmissionDateValue] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);

  const handleInlineSave = useCallback(
    async (studentId: string, field: string, value: string) => {
      setEditingCell(null);
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const current = String((student as any)[field] ?? "");
      if (value === current) return;
      try {
        await updateStudent(studentId, { [field]: value || null } as any);
        toast.success("Actualizado");
        onRefresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al actualizar");
      }
    },
    [students, onRefresh],
  );

  const handleBirthDateSave = useCallback(
    async (studentId: string, day: string, month: string, year: string) => {
      setEditingCell(null);
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const d = day ? Number(day) : null;
      const m = month ? Number(month) : null;
      const y = year ? Number(year) : null;
      if (d === student.birth_day && m === student.birth_month && y === student.birth_year) return;
      try {
        await updateStudent(studentId, { birth_day: d, birth_month: m, birth_year: y } as any);
        toast.success("Actualizado");
        onRefresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al actualizar");
      }
    },
    [students, onRefresh],
  );

  const selectedIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => students[Number(key)]?.id)
    .filter(Boolean);

  async function handleCreate(data: StudentFormValues) {
    try {
      await createStudent(data as any);
      toast.success("Alumno creado correctamente");
      setDialogOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    }
  }

  async function handleUpdate(data: StudentFormValues) {
    try {
      if (!selectedStudent) return;
      await updateStudent(selectedStudent.id, data as any);
      toast.success("Alumno actualizado correctamente");
      setDialogOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  async function handleDelete() {
    try {
      if (!selectedStudent) return;
      await deleteStudent(selectedStudent.id);
      toast.success("Alumno eliminado correctamente");
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  async function handleBulkDelete() {
    try {
      if (selectedIds.length === 0) return;
      await deleteStudents(selectedIds);
      toast.success(`${selectedIds.length} alumno(s) eliminado(s)`);
      setRowSelection({});
      setBulkDeleteOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  async function handleApplyAdmissionDate() {
    if (!admissionDateValue) return;
    const ids = applyToAll ? students.map((s) => s.id) : selectedIds;
    if (ids.length === 0) {
      toast.error("Seleccioná al menos un alumno o elegí 'Todos'");
      return;
    }
    try {
      await Promise.all(ids.map((id) => updateStudent(id, { admission_date: admissionDateValue } as any)));
      toast.success(`Fecha de ingreso aplicada a ${ids.length} alumno(s)`);
      setAdmissionDateOpen(false);
      setAdmissionDateValue("");
      setApplyToAll(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  function openCreateDialog() {
    setSelectedStudent(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEditDialog(student: Student) {
    setSelectedStudent(student);
    setDialogMode("edit");
    setDialogOpen(true);
  }

  function openDeleteDialog(student: Student) {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  }

  const multiSelectFilter: FilterFn<Student> = (row, columnId, filterValue) => {
    if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0))
      return true;
    const selected: string[] = Array.isArray(filterValue) ? filterValue : [];
    const cellValue = String(row.getValue(columnId) ?? "");
    return selected.includes(cellValue);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "order_number",
      enableColumnFilter: false,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1 text-xs whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          N°
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "order_number";
        if (isEditing) {
          return (
            <Input
              autoFocus
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleInlineSave(s.id, "order_number", editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineSave(s.id, "order_number", editValue);
                if (e.key === "Escape") setEditingCell(null);
              }}
              className="h-7 text-xs w-14"
            />
          );
        }
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center text-xs"
            onClick={() => {
              setEditingCell({ id: s.id, field: "order_number" });
              setEditValue(String(s.order_number));
            }}
          >
            {s.order_number}
          </span>
        );
      },
      meta: { className: "text-center w-[50px] min-w-[50px] max-w-[50px]" },
    },
    {
      accessorKey: "full_name",
      enableColumnFilter: false,
      header: ({ table, column }) => (
        <div className="flex items-center gap-1">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
          />
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Apellido y Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "full_name";
        return (
          <div className="flex items-center gap-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Seleccionar"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => openEditDialog(s)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => openDeleteDialog(s)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
              <span className="sr-only">Eliminar</span>
            </Button>
            {isEditing ? (
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleInlineSave(s.id, "full_name", editValue)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInlineSave(s.id, "full_name", editValue);
                  if (e.key === "Escape") setEditingCell(null);
                }}
                className="h-7 text-xs flex-1 min-w-0"
              />
            ) : (
              <span
                className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center truncate"
                onClick={() => {
                  setEditingCell({ id: s.id, field: "full_name" });
                  setEditValue(s.full_name);
                }}
              >
                {s.full_name}
              </span>
            )}
          </div>
        );
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "dni",
      enableColumnFilter: false,
      header: "DNI",
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "dni";
        if (isEditing) {
          return (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleInlineSave(s.id, "dni", editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineSave(s.id, "dni", editValue);
                if (e.key === "Escape") setEditingCell(null);
              }}
              className="h-7 text-xs w-24"
            />
          );
        }
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center text-xs"
            onClick={() => {
              setEditingCell({ id: s.id, field: "dni" });
              setEditValue(s.dni ?? "");
            }}
          >
            {s.dni || <span className="text-muted-foreground">--</span>}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
    {
      id: "birth_date",
      enableColumnFilter: false,
      header: "Fecha Nac.",
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "birth_date";
        if (isEditing) {
          const parts = editValue.split("/");
          return (
            <div className="flex gap-0.5">
              <Input
                autoFocus
                type="number"
                min="1"
                max="31"
                value={parts[0] || ""}
                onChange={(e) => setEditValue(`${e.target.value}/${parts[1] || ""}/${parts[2] || ""}`)}
                className="h-7 text-xs w-10 px-1"
                placeholder="D"
              />
              <Input
                type="number"
                min="1"
                max="12"
                value={parts[1] || ""}
                onChange={(e) => setEditValue(`${parts[0] || ""}/${e.target.value}/${parts[2] || ""}`)}
                className="h-7 text-xs w-10 px-1"
                placeholder="M"
              />
              <Input
                type="number"
                min="1900"
                max="2100"
                value={parts[2] || ""}
                onChange={(e) => setEditValue(`${parts[0] || ""}/${parts[1] || ""}/${e.target.value}`)}
                onBlur={() => {
                  const [d, m, y] = editValue.split("/");
                  handleBirthDateSave(s.id, d || "", m || "", y || "");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingCell(null);
                }}
                className="h-7 text-xs w-14 px-1"
                placeholder="Año"
              />
            </div>
          );
        }
        const d = s.birth_day;
        const m = s.birth_month;
        const y = s.birth_year;
        const display = d && m && y ? `${d}/${m}/${y}` : "--";
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center text-xs"
            onClick={() => {
              setEditingCell({ id: s.id, field: "birth_date" });
              setEditValue(`${d || ""}/${m || ""}/${y || ""}`);
            }}
          >
            {display}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "nationality",
      header: "Nacionalidad",
      filterFn: multiSelectFilter,
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "nationality";
        if (isEditing) {
          return (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleInlineSave(s.id, "nationality", editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineSave(s.id, "nationality", editValue);
                if (e.key === "Escape") setEditingCell(null);
              }}
              className="h-7 text-xs"
            />
          );
        }
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center"
            onClick={() => {
              setEditingCell({ id: s.id, field: "nationality" });
              setEditValue(s.nationality ?? "");
            }}
          >
            {s.nationality || <span className="text-muted-foreground">—</span>}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "sex",
      header: "Sexo",
      filterFn: multiSelectFilter,
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "sex";
        if (isEditing) {
          return (
            <Select
              value={editValue}
              onValueChange={(val) => {
                setEditValue(val);
                handleInlineSave(s.id, "sex", val);
              }}
            >
              <SelectTrigger className="h-7 text-xs w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="V">V</SelectItem>
                <SelectItem value="M">M</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        const sex = s.sex;
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center text-xs"
            onClick={() => {
              setEditingCell({ id: s.id, field: "sex" });
              setEditValue(sex ?? "");
            }}
          >
            {sex || <span className="text-muted-foreground">--</span>}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "age_range",
      header: "Edad",
      filterFn: multiSelectFilter,
      cell: ({ row }) => {
        const range = row.original.age_range;
        if (!range) return "--";
        return <Badge variant="outline">{range}</Badge>;
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "phone",
      enableColumnFilter: false,
      header: "Teléfono",
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "phone";
        if (isEditing) {
          return (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleInlineSave(s.id, "phone", editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineSave(s.id, "phone", editValue);
                if (e.key === "Escape") setEditingCell(null);
              }}
              className="h-7 text-xs"
            />
          );
        }
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center"
            onClick={() => {
              setEditingCell({ id: s.id, field: "phone" });
              setEditValue(s.phone ?? "");
            }}
          >
            {s.phone || <span className="text-muted-foreground">—</span>}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "admission_date",
      enableColumnFilter: false,
      header: "Fecha Ingreso",
      cell: ({ row }) => {
        const s = row.original;
        const isEditing = editingCell?.id === s.id && editingCell?.field === "admission_date";
        if (isEditing) {
          return (
            <Input
              autoFocus
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleInlineSave(s.id, "admission_date", editValue)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditingCell(null);
              }}
              className="h-7 text-xs w-32"
            />
          );
        }
        const d = s.admission_date;
        const display = d ? new Date(d).toLocaleDateString("es-AR") : "--";
        return (
          <span
            className="cursor-pointer rounded px-1 hover:bg-accent min-h-[28px] inline-flex items-center text-xs"
            onClick={() => {
              setEditingCell({ id: s.id, field: "admission_date" });
              setEditValue(d ?? "");
            }}
          >
            {display}
          </span>
        );
      },
      meta: { className: "text-center" },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        searchColumn="full_name"
        searchPlaceholder="Buscar por nombre..."
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        toolbar={
          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={() => setAdmissionDateOpen(true)}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Fecha de Ingreso
            </Button>
            <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Importar Lista
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Alumno
            </Button>
          </div>
        }
      />
      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === "create" ? handleCreate : handleUpdate}
        student={selectedStudent}
        mode={dialogMode}
      />
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImported={onRefresh}
      />
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar alumno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará a{" "}
              <strong>{selectedStudent?.full_name}</strong> y todos sus datos
              de asistencia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedIds.length} alumno(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán{" "}
              <strong>{selectedIds.length}</strong> alumno(s) y todos sus datos
              de asistencia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={admissionDateOpen} onOpenChange={setAdmissionDateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fecha de Ingreso</DialogTitle>
            <DialogDescription>
              Seleccione la fecha y el alcance para aplicar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <input
                type="date"
                value={admissionDateValue}
                onChange={(e) => setAdmissionDateValue(e.target.value)}
                className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aplicar a</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="admissionScope"
                    checked={!applyToAll}
                    onChange={() => setApplyToAll(false)}
                  />
                  Seleccionados ({selectedIds.length})
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="admissionScope"
                    checked={applyToAll}
                    onChange={() => setApplyToAll(true)}
                  />
                  Todos ({students.length})
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmissionDateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApplyAdmissionDate}
              disabled={!admissionDateValue}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

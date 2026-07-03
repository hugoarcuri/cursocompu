"use client";

import { useState } from "react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Plus,
  ClipboardList,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      id: "select",
      enableColumnFilter: false,
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-[40px] text-center" },
    },
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
      cell: ({ row }) => (
        <span className="text-xs">{row.original.order_number}</span>
      ),
      meta: { className: "text-center w-[50px] min-w-[50px] max-w-[50px]" },
    },
    {
      accessorKey: "full_name",
      enableColumnFilter: false,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellido y Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => openEditDialog(row.original)}
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => openDeleteDialog(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
            <span className="sr-only">Eliminar</span>
          </Button>
          <span>{row.original.full_name}</span>
        </div>
      ),
      meta: { className: "text-center" },
    },
    {
      id: "birth_date",
      enableColumnFilter: false,
      header: "Fecha de Nacimiento",
      cell: ({ row }) => {
        const s = row.original;
        if (!s.birth_day || !s.birth_month || !s.birth_year) return "--";
        return `${s.birth_day}/${s.birth_month}/${s.birth_year}`;
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "nationality",
      header: "Nacionalidad",
      filterFn: multiSelectFilter,
      meta: { className: "text-center" },
    },
    {
      accessorKey: "sex",
      header: "Sexo",
      filterFn: multiSelectFilter,
      cell: ({ row }) => {
        const sex = row.original.sex;
        if (!sex) return "--";
        return sex === "V" ? "V" : "F";
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
      meta: { className: "text-center" },
    },
    {
      accessorKey: "admission_date",
      enableColumnFilter: false,
      header: "Fecha de Ingreso",
      cell: ({ row }) => {
        const d = row.original.admission_date;
        if (!d) return "--";
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
    </>
  );
}

"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Plus,
  ClipboardList,
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
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

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

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          N° Orden
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { className: "text-center" },
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellido y Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { className: "text-center" },
    },
    {
      id: "birth_date",
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
      meta: { className: "text-center" },
    },
    {
      accessorKey: "sex",
      header: "Sexo",
      cell: ({ row }) => {
        const sex = row.original.sex;
        if (!sex) return "--";
        return sex === "M" ? "Masculino" : "Femenino";
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "age_range",
      header: "Edad",
      cell: ({ row }) => {
        const range = row.original.age_range;
        if (!range) return "--";
        return <Badge variant="outline">{range} años</Badge>;
      },
      meta: { className: "text-center" },
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      meta: { className: "text-center" },
    },
    {
      accessorKey: "admission_date",
      header: "Fecha de Ingreso",
      cell: ({ row }) => {
        const d = row.original.admission_date;
        if (!d) return "--";
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      },
      meta: { className: "text-center" },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row.original)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(row.original)}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      ),
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
        toolbar={
          <div className="flex gap-2">
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
    </>
  );
}

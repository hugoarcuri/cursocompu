"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { studentFormSchema, StudentFormValues, AGE_RANGES } from "@/lib/validations";
import { Student } from "@/types";
import { Loader2 } from "lucide-react";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormValues) => Promise<void>;
  student?: Student | null;
  mode: "create" | "edit";
}

function calcAgeRange(
  day: number | null,
  month: number | null,
  year: number | null,
  ref: string,
): string | null {
  if (!day || !month || !year || !ref) return null;
  const refDate = new Date(ref);
  const birth = new Date(year, month - 1, day);
  let age = refDate.getFullYear() - birth.getFullYear();
  const monthDiff = refDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birth.getDate())) age--;
  if (age < 14) return null;
  if (age <= 24) return String(age);
  if (age <= 29) return "25-29";
  if (age <= 34) return "30-34";
  if (age <= 39) return "35-39";
  if (age <= 49) return "40-49";
  return "50+";
}

const defaultValues: StudentFormValues = {
  order_number: 1,
  full_name: "",
  inscription_number: "",
  birth_day: null,
  birth_month: null,
  birth_year: null,
  reference_date: "",
  nationality: "",
  sex: null,
  admission_date: "",
  exit_date: "",
  exit_reason: "",
  age_range: null,
  address: "",
  phone: "",
};

export function StudentDialog({
  open,
  onOpenChange,
  onSubmit,
  student,
  mode,
}: StudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues,
  });

  const birthDay = form.watch("birth_day");
  const birthMonth = form.watch("birth_month");
  const birthYear = form.watch("birth_year");
  const refDate = form.watch("reference_date");

  useEffect(() => {
    const range = calcAgeRange(birthDay, birthMonth, birthYear, refDate);
    form.setValue("age_range", range, { shouldValidate: false });
  }, [birthDay, birthMonth, birthYear, refDate, form]);

  useEffect(() => {
    if (student && mode === "edit") {
      form.reset({
        order_number: student.order_number,
        full_name: student.full_name,
        inscription_number: student.inscription_number ?? "",
        birth_day: student.birth_day,
        birth_month: student.birth_month,
        birth_year: student.birth_year,
        reference_date: "",
        nationality: student.nationality ?? "",
        sex: student.sex,
        admission_date: student.admission_date ?? "",
        exit_date: student.exit_date ?? "",
        exit_reason: student.exit_reason ?? "",
        age_range: student.age_range,
        address: student.address ?? "",
        phone: student.phone ?? "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [student, mode, form]);

  async function handleSubmit(data: any) {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset(defaultValues);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo Alumno" : "Editar Alumno"}
          </DialogTitle>
          <DialogDescription>
            Complete los datos del alumno según la planilla de registro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                
                name="order_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° de Orden</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                
                name="full_name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Apellido y Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              
              name="inscription_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° de Inscripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  
                  name="birth_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Día"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  
                  name="birth_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Mes"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  
                  name="birth_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Año"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                
                name="admission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                
                name="exit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Egreso</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              
              name="exit_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Causas del Egreso</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="reference_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Referencia (edad)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              
              name="age_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad en Años</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rango" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range} años
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio y Localidad</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Crear" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

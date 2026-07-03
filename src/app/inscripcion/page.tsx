"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { publicRegisterSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import {
  fetchInscriptionLinks as getLinks,
  registerPublicStudent,
} from "@/lib/queries";

function InscriptionForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">(
    "loading",
  );
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(publicRegisterSchema) as any,
    defaultValues: {
      full_name: "",
      birth_day: undefined,
      birth_month: undefined,
      birth_year: undefined,
      nationality: "",
      sex: undefined,
      address: "",
      phone: "",
    },
  });

  useEffect(() => {
    async function checkLink() {
      try {
        if (!token) {
          setStatus("invalid");
          return;
        }
        const links = await getLinks();
        const link = links.find((l) => l.token === token && l.is_active);
        setStatus(link ? "valid" : "invalid");
      } catch {
        setStatus("invalid");
      }
    }
    checkLink();
  }, [token]);

  async function onSubmit(data: any) {
    try {
      await registerPublicStudent({
        ...data,
        birth_day: Number(data.birth_day),
        birth_month: Number(data.birth_month),
        birth_year: Number(data.birth_year),
        admission_date: new Date().toISOString().split("T")[0],
      });
      setSubmitted(true);
      toast.success("Inscripción completada con éxito");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al enviar el formulario",
      );
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle>Enlace inválido o desactivado</CardTitle>
            <CardDescription>
              Este enlace de inscripción no está disponible. Contacte al
              administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle>¡Inscripción completada!</CardTitle>
            <CardDescription>
              Sus datos han sido registrados correctamente. Pronto será
              contactado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Inscripción al Curso de Computación</CardTitle>
          <CardDescription>
            Complete sus datos para registrarse en el curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido y Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez, Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Fecha de Nacimiento *</FormLabel>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <FormField
                    
                    name="birth_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Día"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : "",
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : "",
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : "",
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidad *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Argentina">
                            Argentina
                          </SelectItem>
                          <SelectItem value="Extranjera">
                            Extranjera
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="V">Varón</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domicilio y Localidad *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Calle y número, Localidad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="011 1234-5678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Inscribirme
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InscripcionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InscriptionForm />
    </Suspense>
  );
}

import { z } from "zod";

const numberField = () =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), z.number().int().nullable());

export const studentFormSchema = z.object({
  order_number: z.preprocess((v) => Number(v), z.number().int().min(1, "Requerido")),
  full_name: z.string().min(2, "Mínimo 2 caracteres"),
  dni: z.string().optional().default(""),
  birth_day: numberField(),
  birth_month: numberField(),
  birth_year: numberField(),
  reference_date: z.string().optional().default(""),
  nationality: z.string().optional().default(""),
  sex: z.enum(["V", "M"]).nullable().optional(),
  admission_date: z.string().optional().default(""),
  exit_date: z.string().optional().default(""),
  exit_reason: z.string().optional().default(""),
  age_range: z.string().nullable().optional(),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
});

export type StudentFormValues = z.input<typeof studentFormSchema>;

export const publicRegisterSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  birth_day: z.preprocess((v) => Number(v), z.number().int().min(1, "Día inválido").max(31, "Día inválido")),
  birth_month: z.preprocess((v) => Number(v), z.number().int().min(1, "Mes inválido").max(12, "Mes inválido")),
  birth_year: z.preprocess((v) => Number(v), z.number().int().min(1900, "Año inválido").max(2100, "Año inválido")),
  nationality: z.string().min(1, "Seleccione una nacionalidad"),
  sex: z.enum(["V", "M"], { message: "Seleccione sexo" }),
  address: z.string().min(5, "Ingrese su domicilio"),
  phone: z.string().min(7, "Ingrese un teléfono válido"),
});

export type PublicRegisterValues = z.input<typeof publicRegisterSchema>;

export const inscriptionLinkSchema = z.object({
  description: z.string().min(1, "Ingrese una descripción"),
});

export type InscriptionLinkValues = z.input<typeof inscriptionLinkSchema>;

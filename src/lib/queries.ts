import { createClient } from "./supabase";
import type { Student, InscriptionLink, Attendance } from "@/types";

function getSupabase() {
  return createClient();
}

function noop<T>(data: T): T {
  return data;
}

export async function fetchStudents() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("order_number");
  if (error) return [];
  return data as Student[];
}

export async function createStudent(values: Record<string, unknown>) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { data, error } = await supabase
    .from("students")
    .insert(values)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

export async function updateStudent(
  id: string,
  values: Record<string, unknown>,
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { data, error } = await supabase
    .from("students")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

export async function deleteStudent(id: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchInscriptionLinks() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("inscription_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as InscriptionLink[];
}

export async function createInscriptionLink(description: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const token = Array.from({ length: 8 }, () =>
    Math.random().toString(36).charAt(2),
  ).join("");
  const { data, error } = await supabase
    .from("inscription_links")
    .insert({ token, description, is_active: true })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InscriptionLink;
}

export async function updateInscriptionLink(
  id: string,
  values: Record<string, unknown>,
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { data, error } = await supabase
    .from("inscription_links")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InscriptionLink;
}

export async function deleteInscriptionLink(id: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { error } = await supabase
    .from("inscription_links")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function batchUpdateAgeRange(
  updates: { id: string; age_range: string | null }[],
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const results = await Promise.allSettled(
    updates.map((u) =>
      supabase
        .from("students")
        .update({ age_range: u.age_range })
        .eq("id", u.id),
    ),
  );
  const errors = results.filter((r) => r.status === "rejected");
  if (errors.length > 0) {
    throw new Error(`Error al actualizar ${errors.length} registros`);
  }
}

export async function fetchAttendanceByMonth(
  month: string,
  year: number,
): Promise<Attendance[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("month", month)
    .eq("year", year);
  if (error) return [];
  return data as Attendance[];
}

export async function upsertAttendanceDay(
  studentId: string,
  month: string,
  year: number,
  day: number,
  value: string | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const dayField = `day_${day}`;

  const { data: existing } = await supabase
    .from("attendance")
    .select("id, day_1, day_2, day_3, day_4, day_5, day_6, day_7, day_8, day_9, day_10, day_11, day_12, day_13, day_14, day_15, day_16, day_17, day_18, day_19, day_20, day_21, day_22, day_23, day_24, day_25, day_26, day_27, day_28, day_29, day_30, day_31")
    .eq("student_id", studentId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  const dayFields: Record<string, string | null> = {};
  for (let d = 1; d <= 31; d++) {
    dayFields[`day_${d}`] = existing ? (existing as Record<string, unknown>)[`day_${d}`] as string | null ?? null : null;
  }
  dayFields[dayField] = value;

  const totalAbsences = Object.values(dayFields).filter((v) => v === "I").length;
  const totalAttendances = Object.values(dayFields).filter((v) => v !== null && v !== "I").length;

  const updateData = {
    ...dayFields,
    total_absences: totalAbsences,
    total_attendances: totalAttendances,
  };

  if (existing) {
    const { error } = await supabase
      .from("attendance")
      .update(updateData)
      .eq("id", (existing as { id: string }).id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("attendance")
      .insert({
        student_id: studentId,
        month,
        year,
        ...updateData,
      });
    if (error) throw new Error(error.message);
  }
}

export async function registerPublicStudent(
  values: Record<string, unknown>,
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Sin conexión a la base de datos");
  const { data: maxOrder } = await supabase
    .from("students")
    .select("order_number")
    .order("order_number", { ascending: false })
    .limit(1)
    .single();
  const nextOrder = (maxOrder?.order_number ?? 0) + 1;
  const { data, error } = await supabase
    .from("students")
    .insert({ ...values, order_number: nextOrder })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

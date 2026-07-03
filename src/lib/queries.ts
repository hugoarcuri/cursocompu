import { createClient } from "./supabase";
import type { Student, InscriptionLink } from "@/types";

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
  for (const u of updates) {
    const { error } = await supabase
      .from("students")
      .update({ age_range: u.age_range })
      .eq("id", u.id);
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

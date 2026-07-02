import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const ageRange = searchParams.get("age_range");
  const sex = searchParams.get("sex");

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("students")
    .select("*")
    .order("order_number", { ascending: true });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }
  if (ageRange) {
    query = query.eq("age_range", ageRange);
  }
  if (sex) {
    query = query.eq("sex", sex);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("students")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

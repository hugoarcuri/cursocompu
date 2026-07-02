import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import crypto from "crypto";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("inscription_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { description } = await request.json();
  const token = crypto.randomUUID().slice(0, 8);

  const { data, error } = await supabase
    .from("inscription_links")
    .insert({ token, description, is_active: true })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

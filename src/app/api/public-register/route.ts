import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();
  const { token, ...studentData } = body;

  const { data: link, error: linkError } = await supabase
    .from("inscription_links")
    .select("is_active")
    .eq("token", token)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });
  }

  if (!link.is_active) {
    return NextResponse.json({ error: "Enlace desactivado" }, { status: 403 });
  }

  const { data: maxOrder } = await supabase
    .from("students")
    .select("order_number")
    .order("order_number", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.order_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("students")
    .insert({
      ...studentData,
      order_number: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

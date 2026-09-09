"use client";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card px-4 py-3 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Curso de Computación · Todos los derechos
      reservados
    </footer>
  );
}
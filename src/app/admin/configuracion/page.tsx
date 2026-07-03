"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InscriptionLink } from "@/types";
import { toast } from "sonner";
import {
  Link2,
  Plus,
  Copy,
  Power,
  PowerOff,
  Trash2,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchInscriptionLinks as getLinks,
  createInscriptionLink as addLink,
  updateInscriptionLink as editLink,
  deleteInscriptionLink as removeLink,
} from "@/lib/queries";

export default function ConfigPage() {
  const [links, setLinks] = useState<InscriptionLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLinks();
      setLinks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function createLink() {
    if (!description.trim()) return;
    setCreating(true);
    try {
      await addLink(description);
      toast.success("Enlace creado correctamente");
      setDescription("");
      setDialogOpen(false);
      fetchLinks();
    } catch {
      toast.error("Error al crear el enlace");
    } finally {
      setCreating(false);
    }
  }

  async function toggleLink(link: InscriptionLink) {
    try {
      await editLink(link.id, { is_active: !link.is_active });
      toast.success(link.is_active ? "Enlace desactivado" : "Enlace activado");
      fetchLinks();
    } catch {
      toast.error("Error al actualizar el enlace");
    }
  }

  async function deleteLink(link: InscriptionLink) {
    try {
      await removeLink(link.id);
      toast.success("Enlace eliminado");
      fetchLinks();
    } catch {
      toast.error("Error al eliminar el enlace");
    }
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  function copyLink(token: string) {
    const url = `${window.location.origin}${basePath}/inscripcion/?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestión de enlaces de inscripción pública.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generar Enlace
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de Inscripción</CardTitle>
          <CardDescription>
            Los enlaces permiten a los alumnos registrarse sin necesidad de
            iniciar sesión. Puede activarlos o desactivarlos en cualquier
            momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No hay enlaces de inscripción. Cree uno para comenzar.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Enlace</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">
                          {link.description}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <code className="rounded bg-muted px-2 py-0.5 text-xs break-all">
                            {basePath}/inscripcion/?token={link.token}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={link.is_active ? "default" : "secondary"}
                          >
                            {link.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(link.created_at).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLink(link.token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleLink(link)}
                            >
                              {link.is_active ? (
                                <PowerOff className="h-4 w-4 text-orange-500" />
                              ) : (
                                <Power className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteLink(link)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {links.map((link) => (
                  <div key={link.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{link.description}</span>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <code className="block text-xs text-muted-foreground break-all">
                      {basePath}/inscripcion/?token={link.token}
                    </code>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(link.created_at).toLocaleDateString("es-AR")}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(link.token)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleLink(link)}>
                          {link.is_active ? (
                            <PowerOff className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLink(link)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Enlace de Inscripción</DialogTitle>
            <DialogDescription>
              Cree un enlace para compartir con los alumnos. No necesitarán
              iniciar sesión para registrarse.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input
                placeholder="Ej: Inscripción Julio 2026"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={createLink} disabled={creating}>
              {creating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

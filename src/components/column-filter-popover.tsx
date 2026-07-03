"use client";

import { useState, useMemo } from "react";
import { Column, Table } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColumnFilterPopoverProps<TData> {
  column: Column<TData, unknown>;
  table: Table<TData>;
  title: string;
}

export function ColumnFilterPopover<TData>({
  column,
  table,
  title,
}: ColumnFilterPopoverProps<TData>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filterValue = column.getFilterValue() as string[] | undefined;
  const selectedValues = useMemo(
    () => new Set(filterValue ?? []),
    [filterValue],
  );

  const uniqueValues = useMemo(() => {
    const facetedValues = column.getFacetedUniqueValues();
    return Array.from(facetedValues?.entries() ?? [])
      .map(([value]) => String(value ?? ""))
      .filter((v) => v !== "")
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [column]);

  const filteredValues = useMemo(
    () =>
      uniqueValues.filter((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      ),
    [uniqueValues, search],
  );

  function toggleValue(value: string) {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    const arr = Array.from(next);
    column.setFilterValue(arr.length > 0 ? arr : undefined);
  }

  function selectAll() {
    column.setFilterValue(undefined);
    setSearch("");
  }

  function clearAll() {
    column.setFilterValue([]);
  }

  const isFiltered = selectedValues.size > 0;
  const allSelected = selectedValues.size === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-5 w-5 p-0 shrink-0 ${isFiltered ? "text-primary" : "text-muted-foreground/60"}`}
        >
          <ChevronsUpDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-56 p-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-medium">{title}</span>
            {isFiltered && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto px-2 pb-2">
            <button
              onClick={selectAll}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                  allSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                }`}
              >
                {allSelected && <Check className="h-3 w-3" />}
              </div>
              (Seleccionar todo)
            </button>
            {filteredValues.map((value) => {
              const isSelected = selectedValues.has(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleValue(value)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  {value}
                </button>
              );
            })}
            {filteredValues.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Sin resultados
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

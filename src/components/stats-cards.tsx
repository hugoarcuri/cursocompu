"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, GitFork, Calendar } from "lucide-react";

interface StatsCardsProps {
  totalStudents: number;
  recentAdmissions: number;
  ageGroups: number;
  isLoading?: boolean;
}

export function StatsCards({
  totalStudents,
  recentAdmissions,
  ageGroups,
  isLoading,
}: StatsCardsProps) {
  const items = [
    {
      title: "Total Alumnos",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Ingresos Recientes",
      value: recentAdmissions,
      icon: UserPlus,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Grupos Etarios",
      value: ageGroups,
      icon: GitFork,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Último Ingreso",
      value: "Hoy",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

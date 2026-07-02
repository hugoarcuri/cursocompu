"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatsCards } from "@/components/stats-cards";
import { Student } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AGE_RANGES } from "@/lib/validations";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#e11d48", "#0ea5e9", "#a3e635",
  "#fb923c",
];

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents)
      .finally(() => setLoading(false));
  }, []);

  const ageDist = AGE_RANGES.reduce(
    (acc, r) => {
      acc[r] = 0;
      return acc;
    },
    {} as Record<string, number>,
  );
  students.forEach((s) => {
    if (s.age_range) ageDist[s.age_range] = (ageDist[s.age_range] ?? 0) + 1;
  });
  const ageChartData = Object.entries(ageDist).map(([name, value]) => ({
    name,
    value,
  }));

  const sexCount = { M: 0, F: 0, otro: 0 };
  students.forEach((s) => {
    if (s.sex === "M") sexCount.M++;
    else if (s.sex === "F") sexCount.F++;
    else sexCount.otro++;
  });
  const sexChartData = [
    { name: "Masculino", value: sexCount.M },
    { name: "Femenino", value: sexCount.F },
  ].filter((d) => d.value > 0);

  const recentAdmissions = students.filter((s) => {
    if (!s.admission_date) return false;
    const d = new Date(s.admission_date);
    const now = new Date();
    return d >= new Date(now.getFullYear(), now.getMonth(), 1);
  }).length;

  const ageGroups = Object.values(ageDist).filter((v) => v > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del registro de alumnos.
        </p>
      </div>
      <StatsCards
        totalStudents={students.length}
        recentAdmissions={recentAdmissions}
        ageGroups={ageGroups}
        isLoading={loading}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Edad</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageChartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sexChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {sexChartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

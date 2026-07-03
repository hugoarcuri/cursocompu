// Script para insertar alumnos desde el PDF de registro
// Ejecutar con: node scripts/insert-students.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://upliskvwkwpwarjajxpq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbGlza3Z3a3dwd2FyamFqeHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjA1MDcsImV4cCI6MjA5ODU5NjUwN30.Eu7JobwqJMSjenmWZvPfWOR54VNtPp-FLhiN-OOalF8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Datos extraídos del PDF de registro
const students = [
  { order_number: 1, full_name: "Abraham María Eva", birth_day: 12, birth_month: 5, birth_year: 1952, nationality: "Argentina", sex: "F" },
  { order_number: 2, full_name: "Agüero Graciela Monica", birth_day: 31, birth_month: 7, birth_year: 1963, nationality: "Argentina", sex: "F" },
  { order_number: 3, full_name: "Calandria Monica Beatriz", birth_day: 20, birth_month: 10, birth_year: 1958, nationality: "Argentina", sex: "F" },
  { order_number: 4, full_name: "Campana José Alejandro", birth_day: 23, birth_month: 3, birth_year: 1943, nationality: "Argentina", sex: "V" },
  { order_number: 5, full_name: "Cambi Susana Inés", birth_day: 23, birth_month: 11, birth_year: 1949, nationality: "Argentina", sex: "F" },
  { order_number: 6, full_name: "Capo Alex Manuel Ernesto", birth_day: 1, birth_month: 9, birth_year: 1956, nationality: "Argentina", sex: "V" },
  { order_number: 7, full_name: "Carminati Ruben Hector", birth_day: 3, birth_month: 8, birth_year: 1955, nationality: "Argentina", sex: "V" },
  { order_number: 8, full_name: "Coello Fabiana Karina", birth_day: 9, birth_month: 10, birth_year: 1967, nationality: "Argentina", sex: "F" },
  { order_number: 9, full_name: "Facenta Gladys Noemi", birth_day: 24, birth_month: 2, birth_year: 1962, nationality: "Argentina", sex: "F" },
  { order_number: 10, full_name: "Faye Monica Elizabeth", birth_day: 17, birth_month: 1, birth_year: 1959, nationality: "Argentina", sex: "F" },
  { order_number: 11, full_name: "Ferraro Jorge Reul", birth_day: 10, birth_month: 6, birth_year: 1960, nationality: "Argentina", sex: "V" },
  { order_number: 12, full_name: "Girado Esther Magdalena", birth_day: 2, birth_month: 5, birth_year: 1959, nationality: "Argentina", sex: "F" },
  { order_number: 13, full_name: "Larroca Francisco Sebastian", birth_day: 23, birth_month: 8, birth_year: 1994, nationality: "Argentina", sex: "V" },
  { order_number: 14, full_name: "Luvragni Juan Carlos", birth_day: 1, birth_month: 11, birth_year: 1952, nationality: "Argentina", sex: "V" },
  { order_number: 15, full_name: "Maguera Huaycho Marcelo Hermelo", birth_day: 8, birth_month: 8, birth_year: 1978, nationality: "Boliviana", sex: "V" },
  { order_number: 16, full_name: "Martirano Miguel Angel", birth_day: 26, birth_month: 11, birth_year: 1959, nationality: "Argentina", sex: "V" },
  { order_number: 17, full_name: "Medina Rosa Yolanda", birth_day: 28, birth_month: 2, birth_year: 1954, nationality: "Argentina", sex: "F" },
  { order_number: 18, full_name: "Menendez Silvia Patricia", birth_day: 6, birth_month: 11, birth_year: 1964, nationality: "Argentina", sex: "F" },
  { order_number: 19, full_name: "Moledo Claudio Alberto", birth_day: 7, birth_month: 12, birth_year: 1954, nationality: "Argentina", sex: "V" },
  { order_number: 20, full_name: "Ortigoza Gonzalo Adrian", birth_day: 19, birth_month: 2, birth_year: 1981, nationality: "Paraguaya", sex: "V" },
  { order_number: 21, full_name: "Pollicelli Fernando José", birth_day: 11, birth_month: 2, birth_year: 1964, nationality: "Argentina", sex: "V" },
  { order_number: 22, full_name: "Ramirez Mónica", birth_day: 7, birth_month: 12, birth_year: 1972, nationality: "Argentina", sex: "F" },
  { order_number: 23, full_name: "Ricciardi Nélida Noemí", birth_day: 20, birth_month: 2, birth_year: 1949, nationality: "Argentina", sex: "F" },
  { order_number: 24, full_name: "Rizzo Nora Beatriz", birth_day: 24, birth_month: 2, birth_year: 1955, nationality: "Argentina", sex: "F" },
  { order_number: 25, full_name: "Rodríguez Julia", birth_day: 13, birth_month: 11, birth_year: 1955, nationality: "Uruguaya", sex: "F" },
  { order_number: 26, full_name: "Rojas Alicia", birth_day: 30, birth_month: 1, birth_year: 1965, nationality: "Argentina", sex: "F" },
  { order_number: 27, full_name: "Román María Elena", birth_day: 31, birth_month: 10, birth_year: 1972, nationality: "Argentina", sex: "F" },
  { order_number: 28, full_name: "Salazar Juana María", birth_day: 27, birth_month: 10, birth_year: 1957, nationality: "Argentina", sex: "F" },
  { order_number: 29, full_name: "Salvá Alicia Esther", birth_day: 16, birth_month: 3, birth_year: 1955, nationality: "Argentina", sex: "F" },
  { order_number: 30, full_name: "Sequeyra Nélida Elizabeth", birth_day: 6, birth_month: 4, birth_year: 1956, nationality: "Argentina", sex: "F" },
  { order_number: 31, full_name: "Torales Gloria Beatriz", birth_day: 20, birth_month: 4, birth_year: 1958, nationality: "Argentina", sex: "F" },
  { order_number: 32, full_name: "Villalba Carlos Antonio", birth_day: 1, birth_month: 6, birth_year: 1955, nationality: "Argentina", sex: "V" },
];

// Calcular age_range basado en la fecha actual
function calcAgeRange(birthYear, birthMonth, birthDay) {
  if (!birthYear) return null;
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  if (birthMonth && birthDay) {
    const bDay = new Date(birthYear, birthMonth - 1, birthDay);
    const now = new Date();
    if (now < bDay) age--;
  }
  if (age < 30) return "25-30";
  if (age < 35) return "30-35";
  if (age < 40) return "35-40";
  if (age < 45) return "40-45";
  if (age < 50) return "45-50";
  if (age < 55) return "50-55";
  if (age < 60) return "55-60";
  if (age < 65) return "60-65";
  if (age < 70) return "65-70";
  if (age < 75) return "70-75";
  if (age < 80) return "75-80";
  return "80+";
}

async function insertStudents() {
  console.log("Insertando alumnos...");

  for (const student of students) {
    const { error } = await supabase
      .from("students")
      .insert({
        order_number: student.order_number,
        full_name: student.full_name,
        birth_day: student.birth_day,
        birth_month: student.birth_month,
        birth_year: student.birth_year,
        nationality: student.nationality,
        sex: student.sex,
      });

    if (error) {
      console.error(`Error insertando ${student.full_name}:`, error.message);
    } else {
      console.log(`✓ ${student.order_number}. ${student.full_name}`);
    }
  }

  console.log("\n¡Listo! Se insertaron", students.length, "alumnos.");
}

insertStudents();

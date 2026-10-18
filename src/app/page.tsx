import { CuentasAbiertas } from "../components/cajero/CuentasAbiertas";
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import styles from "./page.module.scss";
import SeleccionCategoria from "../components/SeleccionCategoria";

export const instant = false;
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}

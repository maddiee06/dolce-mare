import { Metadata } from "next";
import { VistaGestionCajas } from "@/src/components/admin/GestionCajas";

export const metadata: Metadata = {
  title: "Dolce Mare - Gestión de Cajas",
  description:
    "Supervisión de turnos de caja, retiros y auditoría de arqueos en Dolce Mare.",
};

export default function GestionCajasPage() {
  return <VistaGestionCajas />;
}

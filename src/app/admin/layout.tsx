import { cookies } from "next/headers";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { TopBar } from "@/src/components/admin/TopBar";
import { Sidebar } from "@/src/components/admin/Sidebar";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const idSede = cookieStore.get("id_sede")?.value;

  let nombreSedeActiva = "Sede no seleccionada";

  if (idSede) {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("sedes")
      .select("nombre")
      .eq("id_sede", idSede)
      .single();

    if (data) {
      nombreSedeActiva = data.nombre;
    }
  }

  return (
    <div className="flex h-screen bg-[#FFF9F0]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar nombreSede={nombreSedeActiva} />

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

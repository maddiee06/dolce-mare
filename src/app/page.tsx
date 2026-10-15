import { CuentasAbiertas } from "../components/cajero/CuentasAbiertas";
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import styles from "./page.module.scss";
import SeleccionCategoria from "../components/SeleccionCategoria";
export const instant = false;

type RelacionNombre = {
  nombre: string;
};

function obtenerNombre(
  relacion: RelacionNombre | RelacionNombre[] | null,
): string {
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? "";
  }
  return relacion?.nombre ?? "";
}

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select(
      `
      id_pedido,
      total,
      fecha_pedido,
      estado:estados_pedido!inner(nombre),
      entrega:tipos_entrega(nombre),
      detalle_pedido(
        cantidad,
        productos(nombre)
      )
    `,
    )
    .order("fecha_pedido", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error al consultar pedidos:", error.message);
  }

  return (
    <main className={styles.layoutPrincipal}>
      {/* =======================================
          COLUMNA IZQUIERDA: Contenido Principal
          ======================================= */}
      <div className={styles.columnaIzquierda}>
        {/* ¡AQUÍ ESTÁ EL COMPONENTE NUEVO QUE FALTABA! */}
        <SeleccionCategoria />

        {error && (
          <p role="alert">Error al consultar pedidos: {error.message}</p>
        )}

        {!error && pedidos && pedidos.length === 0 && (
          <p>No se encontraron pedidos en la base de datos.</p>
        )}

        {/* Lista de pedidos */}
        {pedidos?.map((pedido) => (
          <div
            key={pedido.id_pedido}
            style={{
              border: "1px solid #eee9e2",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          >
            <p>
              <strong>Pedido #{pedido.id_pedido}</strong> — S/{" "}
              {Number(pedido.total ?? 0).toFixed(2)}
            </p>
            <p>Estado: {obtenerNombre(pedido.estado)}</p>
            <p>Entrega: {obtenerNombre(pedido.entrega)}</p>
            {pedido.detalle_pedido?.map((detalle, index) => (
              <p key={index}>
                {detalle.cantidad}x {obtenerNombre(detalle.productos)}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* =======================================
          COLUMNA DERECHA: Panel lateral
          ======================================= */}
      <aside className={styles.columnaDerecha}>
        {!error && <CuentasAbiertas pedidos={pedidos ?? []} />}
      </aside>
    </main>
  );
}

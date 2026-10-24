import InventarioTabs from "../../../components/cajero/Inventario/InventarioTabs";

export default function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // El <main> del layout de cajero es flex-1 con overflow-hidden:
    // esta capa ocupa todo su alto y maneja el scroll de las vistas de inventario.
    <div className="h-full overflow-y-auto">
      <section className="mx-auto w-full max-w-6xl px-6 py-6 pb-16">
        <InventarioTabs />
        {children}
      </section>
    </div>
  );
}
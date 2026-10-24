import { Metadata } from "next";
import InventarioTabs from "../../../components/cajero/Inventario/InventarioTabs";

export const metadata: Metadata = {
  title: "Dolce Mare - Inventario",
};

export default function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <section className="mx-auto w-full max-w-6xl px-6 py-6 pb-16">
        <InventarioTabs />
        {children}
      </section>
    </div>
  );
}

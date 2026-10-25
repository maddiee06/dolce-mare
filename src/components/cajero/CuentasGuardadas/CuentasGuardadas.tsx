import React from 'react';
import Link from 'next/link';
import styles from './CuentasGuardadas.module.scss';

export interface CuentaGuardadaType {
  id_pedido: number; 
  cliente: string; 
  direccion_entrega: string | null; 
  detalle: string; 
  total: number; 
  fecha_pedido: string; 
  estado: string; 
  tipo_entrega: string; 
}

interface CuentasGuardadasProps {
  cuentas: CuentaGuardadaType[];
  cargando: boolean;
}

function obtenerHoraYFecha(fechaIso: string): { hora: string, fechaStr: string } {
  if (!fechaIso) return { hora: "--:--", fechaStr: "--/--/----" };
  const fecha = new Date(fechaIso);
  
  const hora = fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });

  const fechaStr = fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Lima",
  });

  return { hora, fechaStr };
}

export const CuentasGuardadas: React.FC<CuentasGuardadasProps> = ({ cuentas, cargando }) => {
  
  const totalPendiente = cuentas.reduce((acumulador, cuenta) => acumulador + Number(cuenta.total), 0);
  
  const cantPendientes = cuentas.filter((c) => {
    if(!c.estado) return false;
    return c.estado.toLowerCase() === "pendiente" || c.estado.toLowerCase() === "abierto";
  }).length;
  
  const cantPreparacion = cuentas.filter((c) => {
    if(!c.estado) return false;
    return c.estado.toLowerCase() === "en preparación";
  }).length;

  return (
    <div className={styles.contenedor}>
      
      {/* ENCABEZADO RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#2d2a26] mb-1">Cuentas Guardadas</h1>
          <p className="text-[#8a8580] text-sm md:text-base">Retoma un pedido o cobra una cuenta cuando esté lista.</p>
        </div>
        <Link href="/cajero" className="w-full md:w-auto">
          <button className="w-full md:w-auto justify-center bg-[#e8956b] hover:bg-[#d88258] text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-colors">
            <span>+</span> Nueva venta
          </button>
        </Link>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className={styles.resumenGrid}>
        <div className={styles.cardAbiertas}>
          <div className="w-12 h-12 bg-[#f9fafb] rounded-full flex items-center justify-center text-[#2a4d8f] shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2d2a26]">{cuentas.length} Cuentas Abiertas</h3>
            <p className="text-[#8a8580] text-sm">{cantPendientes} pendientes · {cantPreparacion} en preparación</p>
          </div>
        </div>

        <div className={styles.cardPendiente}>
          <div>
            <h3 className="text-[#e8956b] font-medium mb-1">Total Pendiente</h3>
            <p className="text-[#8a8580] text-sm">Todas las cuentas en curso</p>
          </div>
          <div className="text-3xl font-bold text-[#2a4d8f]">
            S/ {totalPendiente.toFixed(2)}
          </div>
        </div>
      </div>

      {/* FILTROS RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-2">
        <div className="relative w-full md:w-[350px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por cliente o ID de pedido" 
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#2a4d8f] text-sm bg-white"
          />
        </div>
        <select className="w-full md:w-auto bg-white border border-gray-200 text-[#2d2a26] text-sm rounded-full px-4 py-2.5 outline-none appearance-none pr-10 cursor-pointer">
          <option>Todos los estados</option>
          <option>Pendiente</option>
          <option>En preparación</option>
        </select>
      </div>

      <div className={styles.tablaContenedor}>
        
        {/* VISTA MÓVIL: TARJETAS (Se oculta en escritorio) */}
        <div className="md:hidden flex flex-col gap-3 p-4">
          {cargando ? (
            <div className="text-center text-[#8a8580] py-8">Cargando cuentas...</div>
          ) : cuentas.length === 0 ? (
            <div className="text-center text-[#8a8580] py-8">No hay cuentas guardadas.</div>
          ) : (
            cuentas.map((cuenta) => {
              const tiempo = obtenerHoraYFecha(cuenta.fecha_pedido);
              return (
                <div key={cuenta.id_pedido} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[#2d2a26]">
                        {cuenta.tipo_entrega?.toLowerCase() === "delivery" ? "Delivery" : cuenta.cliente || "Cliente"}
                      </div>
                      <div className="text-xs text-[#8a8580] mt-0.5">#{cuenta.id_pedido}</div>
                    </div>
                    <div className="font-bold text-[#2d2a26] text-lg">
                      S/ {Number(cuenta.total).toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[#2d2a26] text-sm font-medium">{cuenta.detalle}</div>
                    {cuenta.direccion_entrega && (
                      <div className="text-xs text-[#8a8580] mt-0.5">{cuenta.direccion_entrega}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#8a8580]">
                    <div>{tiempo.hora} · {tiempo.fechaStr}</div>
                    <span className={cuenta.estado?.toLowerCase() === "pendiente" || cuenta.estado?.toLowerCase() === "abierto" ? styles.badgePendiente : styles.badgePreparacion}>
                      <span className={`${styles.dot} ${cuenta.estado?.toLowerCase() === "pendiente" || cuenta.estado?.toLowerCase() === "abierto" ? "bg-[#b38600]" : "bg-[#2a4d8f]"}`}></span>
                      {cuenta.estado || "Abierto"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1">
                    <button className="flex-1 bg-gray-50 text-[#2a4d8f] font-semibold text-sm py-2 rounded-lg flex justify-center items-center gap-1 transition-colors hover:bg-gray-100">
                       Editar
                    </button>
                    <button className="flex-1 bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors py-2 rounded-lg font-semibold text-sm flex justify-center items-center gap-1">
                       Cobrar
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* VISTA ESCRITORIO: TABLA (Se oculta en móvil) */}
        <div className="hidden md:block overflow-x-auto">
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Cliente / ID</th>
                <th>Detalle de ítems</th>
                <th>Total</th>
                <th>Hora de creación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8a8580]">Cargando cuentas...</td>
                </tr>
              ) : cuentas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8a8580]">No hay cuentas guardadas en este momento.</td>
                </tr>
              ) : (
                cuentas.map((cuenta) => {
                  const tiempo = obtenerHoraYFecha(cuenta.fecha_pedido);
                  return (
                    <tr key={cuenta.id_pedido}>
                      <td>
                        <div className="font-bold text-[#2d2a26]">
                          {cuenta.tipo_entrega?.toLowerCase() === "delivery" ? "Delivery" : cuenta.cliente || "Cliente"}
                        </div>
                        <div className="text-xs text-[#8a8580] mt-0.5">#{cuenta.id_pedido}</div>
                      </td>
                      <td>
                        <div className="text-[#2d2a26] font-medium truncate max-w-[250px]">{cuenta.detalle}</div>
                        {cuenta.direccion_entrega && (
                          <div className="text-xs text-[#8a8580] mt-0.5 truncate max-w-[250px]">{cuenta.direccion_entrega}</div>
                        )}
                      </td>
                      <td className="font-bold text-[#2d2a26]">S/ {Number(cuenta.total).toFixed(2)}</td>
                      <td>
                        <div className="text-[#2d2a26]">{tiempo.hora}</div>
                        <div className="text-xs text-[#8a8580] mt-0.5">{tiempo.fechaStr}</div>
                      </td>
                      <td>
                        <span className={cuenta.estado?.toLowerCase() === "pendiente" || cuenta.estado?.toLowerCase() === "abierto" ? styles.badgePendiente : styles.badgePreparacion}>
                          <span className={`${styles.dot} ${cuenta.estado?.toLowerCase() === "pendiente" || cuenta.estado?.toLowerCase() === "abierto" ? "bg-[#b38600]" : "bg-[#2a4d8f]"}`}></span>
                          {cuenta.estado || "Abierto"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <button className="text-[#2a4d8f] font-semibold text-sm hover:underline flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            Editar
                          </button>
                          <button className="bg-[#fbe8dd] text-[#e8956b] hover:bg-[#e8956b] hover:text-white transition-colors px-4 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                            Cobrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER TABLA */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-[#8a8580] gap-2">
          <p>Mostrando {cuentas.length} de {cuentas.length} cuentas</p>
          <p className="flex items-center text-center gap-1">
            <svg className="hidden md:block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Editar conserva los ítems y sabores de la cuenta.
          </p>
        </div>
      </div>

    </div>
  );
};
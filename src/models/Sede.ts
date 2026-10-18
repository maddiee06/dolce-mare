export interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string;
  distrito: string | null;
  telefono: string | null;
  ruc_emision: string | null;
  estado: boolean;
  creado_en: string;
}

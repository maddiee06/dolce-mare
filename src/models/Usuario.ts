export type RolNombre = "Admin" | "Cajero";

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  rol: RolNombre;
}

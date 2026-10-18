export type RolNombre = "ADMIN" | "CAJERO";

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  rol: RolNombre;
}
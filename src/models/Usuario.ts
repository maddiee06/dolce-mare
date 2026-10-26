export type RolNombre = "Admin" | "Cajero";

export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombres: string;
  apellidos: string;
  dni?: string;
  correo: string;
  usuario: string;
  contrasena_hash: string;
  telefono?: string;
  estado: boolean;
  ultimo_acceso?: Date | string;
  eliminado_en?: Date | string;
  creado_en: Date | string;
  actualizado_en: Date | string;
}

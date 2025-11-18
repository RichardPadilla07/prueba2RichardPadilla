// Tipos de la base de datos Supabase

export type UserRole = 'usuario_registrado' | 'asesor_comercial';

export type ContratoEstado = 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado';

export interface Perfil {
  id: string;
  user_id: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
}

export interface PlanMovil {
  id: number;
  nombre: string;
  precio: number;
  segmento?: string;
  publico_objetivo?: string;
  datos?: string;
  minutos?: string;
  sms?: string;
  velocidad?: string;
  redes_sociales?: string;
  imagen_url?: string;
  activo: boolean;
}

export interface Contratacion {
  id: number;
  usuario_id: string;
  plan_id: number;
  estado: ContratoEstado;
  fecha: string;
  // Relaciones expandidas
  planes_moviles?: PlanMovil;
}

export interface MensajeChat {
  id: number;
  contratacion_id: number;
  emisor: string;
  mensaje: string;
  fecha: string;
}

// Tipos para inserciones (sin campos auto-generados)
export type PerfilInsert = Omit<Perfil, 'id'>;
export type PlanMovilInsert = Omit<PlanMovil, 'id'>;
export type ContratacionInsert = Omit<Contratacion, 'id' | 'fecha'>;
export type MensajeChatInsert = Omit<MensajeChat, 'id' | 'fecha'>;

// Tipos para actualizaciones (todos los campos opcionales)
export type PerfilUpdate = Partial<Omit<Perfil, 'id' | 'user_id'>>;
export type PlanMovilUpdate = Partial<Omit<PlanMovil, 'id'>>;
export type ContratacionUpdate = Partial<Omit<Contratacion, 'id' | 'fecha'>>;

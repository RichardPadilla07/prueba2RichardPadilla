// Tipos de la base de datos Supabase

export type UserRole = 'invitado' | 'usuario_registrado' | 'asesor_comercial';

export type ContratoEstado = 'pendiente' | 'aceptado' | 'rechazado';

export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface PlanMovil {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  datos_gb: number;
  minutos: number;
  sms: number;
  imagen_url?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Contratacion {
  id: string;
  usuario_id: string;
  plan_id: string;
  estado: ContratoEstado;
  fecha_contratacion: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones expandidas
  usuario?: Perfil;
  plan?: PlanMovil;
}

export interface MensajeChat {
  id: string;
  contratacion_id: string;
  emisor_id: string;
  mensaje: string;
  leido: boolean;
  created_at?: string;
  // Relaciones expandidas
  emisor?: Perfil;
}

// Tipos para inserciones (sin campos auto-generados)
export type PerfilInsert = Omit<Perfil, 'created_at' | 'updated_at'>;
export type PlanMovilInsert = Omit<PlanMovil, 'id' | 'created_at' | 'updated_at'>;
export type ContratacionInsert = Omit<Contratacion, 'id' | 'created_at' | 'updated_at'>;
export type MensajeChatInsert = Omit<MensajeChat, 'id' | 'created_at'>;

// Tipos para actualizaciones (todos los campos opcionales)
export type PerfilUpdate = Partial<Omit<Perfil, 'id' | 'created_at'>>;
export type PlanMovilUpdate = Partial<Omit<PlanMovil, 'id' | 'created_at'>>;
export type ContratacionUpdate = Partial<Omit<Contratacion, 'id' | 'created_at'>>;

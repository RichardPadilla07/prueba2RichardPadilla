import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Contratacion, ContratacionInsert, ContratacionUpdate, ContratoEstado } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {
  private contrataciones = new BehaviorSubject<Contratacion[]>([]);
  public contrataciones$ = this.contrataciones.asObservable();
  private realtimeChannel?: RealtimeChannel;

  constructor(private supabase: SupabaseService) {
    this.subscribeToChanges();
  }

  /**
   * Suscribe a cambios en tiempo real
   */
  private subscribeToChanges() {
    this.realtimeChannel = this.supabase.client
      .channel('contrataciones_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contrataciones' },
        () => {
          this.loadContrataciones();
        }
      )
      .subscribe();
  }

  /**
   * Carga contrataciones según el rol del usuario
   */
  private async loadContrataciones() {
    const userId = this.supabase.currentUserValue?.id;
    if (!userId) return;

    // Obtener las contrataciones con información de plan y usuario
    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .order('fecha', { ascending: false });

    if (data && !error) {
      this.contrataciones.next(data as any);
    }
  }

  /**
   * Obtiene las contrataciones del usuario actual
   */
  async getMisContrataciones(): Promise<Contratacion[]> {
    const userId = this.supabase.currentUserValue?.id;
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false });

    return data as any || [];
  }

  /**
   * Obtiene todas las contrataciones (para asesores)
   */
  async getAllContrataciones(estado?: ContratoEstado): Promise<Contratacion[]> {
    let query = this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .order('fecha', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;
    return data as any || [];
  }

  /**
   * Obtiene una contratación por ID
   */
  async getContratacionById(id: number): Promise<Contratacion | null> {
    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .eq('id', id)
      .single();

    return data as any || null;
  }

  /**
   * Crea una nueva contratación
   */
  async createContratacion(planId: number): Promise<{ success: boolean; data?: Contratacion; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const contratacionData: ContratacionInsert = {
        usuario_id: userId,
        plan_id: planId,
        estado: 'pendiente'
      };

      const { data, error } = await this.supabase.client
        .from('contrataciones')
        .insert(contratacionData)
        .select(`
          *,
          planes_moviles(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as any };
    } catch (error: any) {
      console.error('Error creando contratación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza el estado de una contratación (solo asesores)
   */
  async updateEstado(id: number, estado: ContratoEstado): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('contrataciones')
        .update({ estado })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza una contratación
   */
  async updateContratacion(id: string, updates: ContratacionUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('contrataciones')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando contratación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Destruir suscripción al salir
   */
  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.supabase.client.removeChannel(this.realtimeChannel);
    }
  }
}

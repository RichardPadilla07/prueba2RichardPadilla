import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
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

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {
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
    const currentProfile = this.authService.getCurrentProfile();
    if (!currentProfile) return;

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
    const currentProfile = this.authService.getCurrentProfile();
    if (!currentProfile) return [];

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .eq('usuario_id', currentProfile.user_id)
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
      const currentProfile = this.authService.getCurrentProfile();
      if (!currentProfile) throw new Error('Usuario no autenticado');

      const contratacionData: ContratacionInsert = {
        usuario_id: currentProfile.user_id,
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
      console.log('Actualizando contratación:', { id, estado });
      
      const { data, error } = await this.supabase.client
        .from('contrataciones')
        .update({ estado })
        .eq('id', id)
        .select();

      console.log('Resultado de actualización:', { data, error });

      if (error) throw error;
      
      // Recargar contrataciones para reflejar el cambio
      await this.loadContrataciones();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancela una contratación (cambia estado a cancelado)
   */
  async cancelarContratacion(id: number): Promise<{ success: boolean; error?: string }> {
    return this.updateEstado(id, 'cancelado');
  }

  /**
   * Verifica si el usuario tiene una contratación activa (pendiente o aceptado)
   */
  async tieneContratacionActiva(): Promise<{ tiene: boolean; contratacion?: Contratacion }> {
    const currentProfile = this.authService.getCurrentProfile();
    if (!currentProfile) return { tiene: false };

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(*)
      `)
      .eq('usuario_id', currentProfile.user_id)
      .in('estado', ['pendiente', 'aceptado'])
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      return { tiene: true, contratacion: data as any };
    }
    
    return { tiene: false };
  }

  /**
   * Verifica si el usuario ya contrató un plan específico (pendiente o aceptado)
   */
  async yaContratoEstePlan(planId: number): Promise<boolean> {
    const currentProfile = this.authService.getCurrentProfile();
    if (!currentProfile) return false;

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select('id')
      .eq('usuario_id', currentProfile.user_id)
      .eq('plan_id', planId)
      .in('estado', ['pendiente', 'aceptado'])
      .limit(1);

    return (data && data.length > 0) || false;
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

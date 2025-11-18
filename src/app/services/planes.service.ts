import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PlanMovil, PlanMovilInsert, PlanMovilUpdate } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private planes = new BehaviorSubject<PlanMovil[]>([]);
  public planes$ = this.planes.asObservable();
  private realtimeChannel?: RealtimeChannel;

  constructor(private supabase: SupabaseService) {
    this.loadPlanes();
    this.subscribeToChanges();
  }

  /**
   * Carga todos los planes activos
   */
  async loadPlanes() {
    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      this.planes.next(data as PlanMovil[]);
    }
  }

  /**
   * Suscribe a cambios en tiempo real
   */
  private subscribeToChanges() {
    this.realtimeChannel = this.supabase.client
      .channel('planes_moviles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'planes_moviles' },
        () => {
          this.loadPlanes();
        }
      )
      .subscribe();
  }

  /**
   * Obtiene todos los planes (incluye inactivos para asesores)
   */
  async getAllPlanes(includeInactive = false): Promise<PlanMovil[]> {
    let query = this.supabase.client
      .from('planes_moviles')
      .select('*')
      .order('id', { ascending: false });

    if (!includeInactive) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;
    return data as PlanMovil[] || [];
  }

  /**
   * Obtiene un plan por ID
   */
  async getPlanById(id: number): Promise<PlanMovil | null> {
    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .select('*')
      .eq('id', id)
      .single();

    return data as PlanMovil || null;
  }

  /**
   * Crea un nuevo plan
   */
  async createPlan(plan: PlanMovilInsert): Promise<{ success: boolean; data?: PlanMovil; error?: string }> {
    try {
      const { data, error } = await this.supabase.client
        .from('planes_moviles')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as PlanMovil };
    } catch (error: any) {
      console.error('Error creando plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza un plan existente
   */
  async updatePlan(id: number, updates: PlanMovilUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('planes_moviles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambia el estado activo/inactivo de un plan
   */
  async toggleActivo(id: number, activo: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('planes_moviles')
        .update({ activo })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error cambiando estado del plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina un plan permanentemente
   */
  async deletePlan(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('planes_moviles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sube una imagen al bucket de Storage
   */
  async uploadImage(file: File, planId: number): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${planId}-${Date.now()}.${fileExt}`;
      const filePath = `planes/${fileName}`;

      const { error: uploadError } = await this.supabase.client.storage
        .from('planes-imagenes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = this.supabase.client.storage
        .from('planes-imagenes')
        .getPublicUrl(filePath);

      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina una imagen del bucket
   */
  async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extraer el path de la URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf('planes-imagenes');
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await this.supabase.client.storage
        .from('planes-imagenes')
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando imagen:', error);
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

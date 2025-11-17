import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MensajeChat, MensajeChatInsert } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajes = new BehaviorSubject<MensajeChat[]>([]);
  public mensajes$ = this.mensajes.asObservable();
  private realtimeChannel?: RealtimeChannel;
  private currentContratacionId?: string;

  constructor(private supabase: SupabaseService) {}

  /**
   * Suscribe a mensajes de una contratación específica
   */
  subscribeToChat(contratacionId: string) {
    // Desuscribir del canal anterior si existe
    if (this.realtimeChannel) {
      this.supabase.client.removeChannel(this.realtimeChannel);
    }

    this.currentContratacionId = contratacionId;
    this.loadMensajes(contratacionId);

    // Suscribirse a cambios en tiempo real
    this.realtimeChannel = this.supabase.client
      .channel(`chat_${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`
        },
        (payload) => {
          this.loadMensajes(contratacionId);
        }
      )
      .subscribe();
  }

  /**
   * Carga los mensajes de una contratación
   */
  private async loadMensajes(contratacionId: string) {
    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .select(`
        *,
        emisor:perfiles!mensajes_chat_emisor_id_fkey(id, nombre, rol)
      `)
      .eq('contratacion_id', contratacionId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      this.mensajes.next(data as any);
    }
  }

  /**
   * Obtiene todos los mensajes de una contratación
   */
  async getMensajes(contratacionId: string): Promise<MensajeChat[]> {
    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .select(`
        *,
        emisor:perfiles!mensajes_chat_emisor_id_fkey(id, nombre, rol)
      `)
      .eq('contratacion_id', contratacionId)
      .order('created_at', { ascending: true });

    return data as any || [];
  }

  /**
   * Envía un mensaje
   */
  async sendMensaje(contratacionId: string, mensaje: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const mensajeData: MensajeChatInsert = {
        contratacion_id: contratacionId,
        emisor_id: userId,
        mensaje,
        leido: false
      };

      const { error } = await this.supabase.client
        .from('mensajes_chat')
        .insert(mensajeData);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marca mensajes como leídos
   */
  async markAsRead(contratacionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const { error } = await this.supabase.client
        .from('mensajes_chat')
        .update({ leido: true })
        .eq('contratacion_id', contratacionId)
        .neq('emisor_id', userId)
        .eq('leido', false);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error marcando mensajes como leídos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el conteo de mensajes no leídos
   */
  async getUnreadCount(contratacionId: string): Promise<number> {
    const userId = this.supabase.currentUserValue?.id;
    if (!userId) return 0;

    const { count, error } = await this.supabase.client
      .from('mensajes_chat')
      .select('*', { count: 'exact', head: true })
      .eq('contratacion_id', contratacionId)
      .neq('emisor_id', userId)
      .eq('leido', false);

    return count || 0;
  }

  /**
   * Desuscribe del chat actual
   */
  unsubscribe() {
    if (this.realtimeChannel) {
      this.supabase.client.removeChannel(this.realtimeChannel);
      this.realtimeChannel = undefined;
    }
    this.currentContratacionId = undefined;
    this.mensajes.next([]);
  }

  /**
   * Destruir suscripción al salir
   */
  ngOnDestroy() {
    this.unsubscribe();
  }
}

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
  private currentContratacionId?: number;

  constructor(private supabase: SupabaseService) {}

  /**
   * Suscribe a mensajes de una contratación específica
   */
  subscribeToChat(contratacionId: number) {
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
   * Carga mensajes desde la base de datos
   */
  private async loadMensajes(contratacionId: number) {
    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .select('*')
      .eq('contratacion_id', contratacionId)
      .order('fecha', { ascending: true});

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
  async sendMensaje(contratacionId: number, mensaje: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const mensajeData: MensajeChatInsert = {
        contratacion_id: contratacionId,
        emisor: userId,
        mensaje
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
  async markAsRead(contratacionId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      // Nota: La tabla no tiene campo leido, esta función no hace nada por ahora
      return { success: true };
    } catch (err: any) {
      console.error('Error marcando mensajes como leídos:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Obtiene el conteo de mensajes no leídos
   */
  async getUnreadCount(contratacionId: number): Promise<number> {
    // Nota: La tabla no tiene campo leido, retorna 0 por ahora
    return 0;
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

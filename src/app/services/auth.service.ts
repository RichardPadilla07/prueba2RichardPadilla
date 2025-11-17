import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Perfil, PerfilInsert, UserRole } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentProfile = new BehaviorSubject<Perfil | null>(null);
  public profile$ = this.currentProfile.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación y carga el perfil
   */
  private async initializeAuth() {
    this.supabase.user$.subscribe(async (user) => {
      if (user) {
        await this.loadUserProfile(user.id);
      } else {
        this.currentProfile.next(null);
      }
    });
  }

  /**
   * Carga el perfil del usuario desde la base de datos
   */
  private async loadUserProfile(userId: string) {
    const { data, error } = await this.supabase.client
      .from('perfiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      this.currentProfile.next(data as Perfil);
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async register(email: string, password: string, nombre: string, telefono?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Crear perfil en la tabla perfiles
      const perfilData: PerfilInsert = {
        user_id: authData.user.id,
        nombre,
        telefono,
        rol: 'usuario_registrado' // Por defecto, todos los nuevos usuarios son registrados
      };

      const { error: perfilError } = await this.supabase.client
        .from('perfiles')
        .insert(perfilData);

      if (perfilError) throw perfilError;

      return { success: true };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Inicio de sesión
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo iniciar sesión');

      await this.loadUserProfile(data.user.id);
      return { success: true };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cierre de sesión
   */
  async logout(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.currentProfile.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el perfil actual
   */
  getCurrentProfile(): Perfil | null {
    return this.currentProfile.value;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getCurrentRole(): UserRole | null {
    return this.currentProfile.value?.rol || null;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.supabase.isAuthenticated() && this.currentProfile.value !== null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.getCurrentRole() === role;
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(updates: Partial<Perfil>): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.supabase.currentUserValue?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const { error } = await this.supabase.client
        .from('perfiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      // Recargar perfil
      await this.loadUserProfile(userId);
      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambia el rol de un usuario (solo para administración)
   */
  async changeUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('perfiles')
        .update({ rol: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error cambiando rol:', error);
      return { success: false, error: error.message };
    }
  }
}

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );

    // Inicializar sesión actual
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.next(data.session?.user ?? null);
    });

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  /**
   * Obtiene el cliente de Supabase
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Observable del usuario actual
   */
  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  /**
   * Usuario actual (valor sincrónico)
   */
  get currentUserValue(): User | null {
    return this.currentUser.value;
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser.value !== null;
  }
}

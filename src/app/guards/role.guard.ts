import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/database.types';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const currentRole = authService.getCurrentRole();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    // Redirigir según el rol
    router.navigate(['/tabs']);
    return false;
  };
}

// Guards específicos para cada rol
export const usuarioRegistradoGuard: CanActivateFn = roleGuard(['usuario_registrado']);
export const asesorComercialGuard: CanActivateFn = roleGuard(['asesor_comercial']);

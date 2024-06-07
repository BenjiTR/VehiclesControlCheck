import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa tu servicio de autenticación

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router si necesitas redireccionar

  if (authService.isActive === true || authService.isInTest === true ) {
    return true;
  } else {
    router.navigate(['/home']); // Redirige a una página específica si no está activo
    return false
  }
};

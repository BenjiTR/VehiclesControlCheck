import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa tu servicio de autenticación
import { DriveService } from './drive.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from './alert.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { SessionService } from './session.service';

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router si necesitas redireccionar
console.log(authService.isActive)
  if (authService.isActive === true || authService.isInTest === true ) {
    return true;
  } else {
    router.navigate(['/home']);
    return false
  }
};







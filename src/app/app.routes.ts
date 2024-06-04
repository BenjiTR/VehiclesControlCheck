import { Routes } from '@angular/router';
import { canActivate } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.page').then( m => m.PrivacyPage)
  },
  {
    path: 'useterms',
    loadComponent: () => import('./useterms/useterms.page').then( m => m.UsetermsPage)
  },
  {
    path: 'newuser',
    loadComponent: () => import('./pages/newuser/newuser.page').then( m => m.NewuserPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'userdataview',
    loadComponent: () => import('./pages/userdataview/userdataview.page').then( m => m.UserdataviewPage)
  },
];

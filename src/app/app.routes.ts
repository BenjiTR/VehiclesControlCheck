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
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage),
    canActivate: [canActivate],
    children:[
      {
        path:'',
        redirectTo:'main',
        pathMatch:'full'
      },
      {
        path: 'main',
        loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage)
      },
      {
        path: 'vehicle',
        loadComponent: () => import('./pages/vehicle/vehicle.page').then( m => m.VehiclePage)
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'userdataview',
    loadComponent: () => import('./pages/userdataview/userdataview.page').then( m => m.UserdataviewPage),
    canActivate: [canActivate]
  },
  {
    path: 'userdata',
    loadComponent: () => import('./pages/userdata/userdata.page').then( m => m.UserdataPage),
    canActivate: [canActivate]
  },


];

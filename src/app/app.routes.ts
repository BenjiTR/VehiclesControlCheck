import { Routes } from '@angular/router';
import { canActivate } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
        path: 'newevent',
        loadComponent: () => import('./pages/newevent/newevent.page').then( m => m.NeweventPage)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.page').then( m => m.NotificationsPage)
      },
      {
        path: 'reminder',
        loadComponent: () => import('./pages/reminder/reminder.page').then( m => m.ReminderPage)
      },
      {
        path: 'backup',
        loadComponent: () => import('./pages/backup/backup.page').then( m => m.BackupPage)
      },
      {
        path: 'userdata',
        loadComponent: () => import('./pages/userdata/userdata.page').then( m => m.UserdataPage),
        canActivate: [canActivate]
      },
      {
        path: 'faqs',
        loadComponent: () => import('./pages/faqs/faqs.page').then( m => m.FaqsPage)
      },
      {
        path: 'problem',
        loadComponent: () => import('./pages/problem/problem.page').then( m => m.ProblemPage)
      },
      {
        path: 'data',
        loadComponent: () => import('./pages/data/data.page').then( m => m.DataPage)
      },

      {
        path: '**',
        redirectTo: 'main',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'main',
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
    path: 'imgmodal',
    loadComponent: () => import('./pages/imgmodal/imgmodal.page').then( m => m.ImgmodalPage),
    canActivate: [canActivate]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },



];

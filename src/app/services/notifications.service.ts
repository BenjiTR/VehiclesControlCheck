import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import type { LocalNotificationsPlugin, PermissionStatus } from '@capacitor/local-notifications';
const LocalNotifications = registerPlugin<LocalNotificationsPlugin>('LocalNotifications');

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  async checkPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.checkPermissions();
  }

  async requestPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.requestPermissions();
  }

  

}

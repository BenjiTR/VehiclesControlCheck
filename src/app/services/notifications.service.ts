import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import type { LocalNotificationSchema, LocalNotificationsPlugin, PendingResult, PermissionStatus } from '@capacitor/local-notifications';
const LocalNotifications = registerPlugin<LocalNotificationsPlugin>('LocalNotifications');

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  //PERMISOS
  async checkPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.checkPermissions();
  }
  async requestPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.requestPermissions();
  }

  //CANAL DE COMUNICACION
  async createChannel(){
    await LocalNotifications.createChannel({
      id: 'VCC',
      name: 'Vehicles Control Check',
      description: 'notifications channel',
      sound: 'clockalarm.wav',
      importance: 5,
      visibility: 1,
      lights: true,
      lightColor: '#ff0606',
      vibration: true
    })
    const channels = await LocalNotifications.listChannels();
  }

  async deleteChannel(){
    await LocalNotifications.deleteChannel({id:'VCC'})
    const channels = await LocalNotifications.listChannels();
  }

  //NOTIFICACIONES
  async getPending():Promise<PendingResult>{
    return await LocalNotifications.getPending();
  }

  async createNotification(notificationsArray:LocalNotificationSchema[]){
    return await LocalNotifications.schedule({notifications:notificationsArray})
  }

  async deleteNotification(notification:LocalNotificationSchema){
    return await LocalNotifications.cancel({notifications:[{id:notification.id}]})
  }



}

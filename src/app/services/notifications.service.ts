import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import type { LocalNotificationsPlugin, PermissionStatus } from '@capacitor/local-notifications';
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
    console.log("Canal creado");
    const channels = await LocalNotifications.listChannels();
    console.log("Lista de canales: ", channels)
  }

  async deleteChannel(){
    await LocalNotifications.deleteChannel({id:'VCC'})
    console.log("Canal destruido");
    const channels = await LocalNotifications.listChannels();
    console.log("Lista de canales: ", channels)
  }



}

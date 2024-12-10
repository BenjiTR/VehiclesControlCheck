import { Injectable, Injector } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import type { LocalNotificationSchema, LocalNotificationsPlugin, PendingResult, PermissionStatus } from '@capacitor/local-notifications';
import  {Platform } from '@ionic/angular/standalone'
import { SessionService } from './session.service';
import { Event } from '../models/event.model';
import { DateService } from './date.service';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { Vehicle } from '../models/vehicles.model';
import { CalendarService } from './calendar.service';
const LocalNotifications = registerPlugin<LocalNotificationsPlugin>('LocalNotifications');



@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  public vehiclesArray:Vehicle[]=[];
  private _session: SessionService | undefined;


  constructor(
    private _platform:Platform,
    private _date:DateService,
    private _storage:StorageService,
    private _calendar:CalendarService,
    private injector: Injector
  ){
  }


  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }


  //PERMISOS
  async checkPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.checkPermissions();
  }
  async requestPermissions(): Promise<PermissionStatus>{
    return LocalNotifications.requestPermissions();
  }

  //CANAL DE COMUNICACION
  async createChannel(){
    if(this._platform.is("android")){
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
  }

  async deleteChannel(){
    if(this._platform.is("android")){
      await LocalNotifications.deleteChannel({id:'VCC'})
      const channels = await LocalNotifications.listChannels();
    }
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


  async setNotifications(events:Event[]):Promise<void>{
    let remindersArray:LocalNotificationSchema[]= await this.SessionService.loadReminders();
    //console.log("eventos", events);
    //console.log("array", remindersArray);
    events.forEach(async event => {
      if(event.reminderDate && event.reminder && this._date.isFutureEvent(event.reminderDate)){
        const index = remindersArray.findIndex(reminder=>reminder.extra.eventId === event.id);
        const reminder = await this.constructReminder(event);
        if (index !=-1){
          remindersArray[index] = reminder;
        }else{
          remindersArray.push(reminder);
        }
        this.createNotification(remindersArray);
      }
      const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id);
      if(id && event.reminder){
        this._calendar.setEventInCalendar(event);
      }
    });
    return;
  }

  async constructReminder(event:Event):Promise<LocalNotificationSchema>{

    const newReminder:LocalNotificationSchema = {
      channelId:"VCC",
      title:await this.currentVehicle(event.vehicleId)+" - "+event.reminderTittle,
      body:event.info,
      largeBody:event.info,
      summaryText:event.info,
      id: event.reminderId!,
      schedule: {at: new Date(event.reminderDate!)},
      sound:'clockalarm.wav',
      extra:{
        eventId:event.id,
        titleWithoutCar:event.reminderTittle,
      }
    }
    return newReminder;
  }

  async currentVehicle(vehicleId:string):Promise<string>{
    this.vehiclesArray = await this.SessionService.loadVehicles();
    //console.log("Array:", this.vehiclesArray)
    const current = this.vehiclesArray.find(vehicle=>vehicle.id === vehicleId);
    return current!.brandOrModel;
  }




}

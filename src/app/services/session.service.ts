import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { imageConstants } from '../const/img';
import { UserTestService } from './user-test.service';
import { AuthService } from './auth.service';
import { Vehicle } from '../models/vehicles.model';
import { Event } from '../models/event.model'
import { NotificationsService } from './notifications.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;
  public vehiclesArray:Vehicle[] = [];
  public eventsArray:Event[] = [];
  public remindersArray:LocalNotificationSchema[] = [];
  public remindNotitications:boolean = false;

  constructor(
    private _storageService: StorageService,
    private _storage:StorageService,
    private _test:UserTestService,
    private _authService:AuthService,
    private _notification:NotificationsService,
    private _platform:Platform
  ){
  }


  async searchphoto(method:string, id:string):Promise<string> {
    if(method === "email"){
      const photo = await this._storageService.getStorageItem(storageConstants.USER_PHOTO+id);
      if(photo){
        return imageConstants.base64Prefix+photo;
      }else{
        return "../../assets/img/user_avatar.png";
      }
    }else{
      return "../../assets/img/user_avatar.png";
    }
  }

  async loadVehicles(): Promise<Vehicle[]>{
    const temporalVehiclesArray = await this._storage.getStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id)
    if(this._authService.isInTest){
      this.vehiclesArray = this._test.vehicles;
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this.vehiclesArray);
      return this.vehiclesArray;
    }else if(!temporalVehiclesArray){
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this.vehiclesArray)
      return this.vehiclesArray;
    }else{
      this.vehiclesArray = temporalVehiclesArray;
      return this.vehiclesArray;
    }
  }

  async loadEvents(): Promise<Event[]>{
    const temporalEventsArray = await this._storage.getStorageItem(storageConstants.USER_EVENTS+this.currentUser.id)
    if(this._authService.isInTest){
      this.eventsArray = this._test.events;
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id, this.eventsArray);
      return this.eventsArray;
    }else if(!temporalEventsArray){
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id, this.eventsArray);
      return this.eventsArray;
    }else{
      this.eventsArray = temporalEventsArray;
      return this.eventsArray;
    }
  }

  async loadReminders(): Promise<LocalNotificationSchema[]>{
    if(this._platform.is("ios")){
        if(this._authService.isInTest){
          const firstArray = await this._test.createTestreminders([]);
          console.log("primer array: ", firstArray);
          await this._notification.createNotification(firstArray);
          const finalArray = await this._notification.getPending();
          this.remindersArray = finalArray.notifications;
          console.log("Array Final: ", this.remindersArray)
          return this.remindersArray;
        }else{
          const temporalArray = await this._notification.getPending()
          this.remindersArray = temporalArray.notifications;
          return this.remindersArray;
        }
    }else{
      this.remindersArray = await this._test.createTestreminders(this.remindersArray);
      return this.remindersArray;
    }


  }

  async setReminderNotifications(reminder:boolean){
    this.remindNotitications = await this._storage.setStorageItem(storageConstants.USER_REMINDER+this.currentUser.id,reminder);
  }
  async getReminderNotifications(){
    this.remindNotitications = await this._storage.getStorageItem(storageConstants.USER_REMINDER+this.currentUser.id) || false;
    console.log("Norificaciones seleccionadas: ", this.remindNotitications);
  }

  deleteTemporalData(){
    this.vehiclesArray = [];
    this.eventsArray = [];
    this.remindersArray = [];
    this.remindNotitications = false;
  }

}

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
import { DriveService } from './drive.service';
import { CryptoService } from './crypto.services';

@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;
  public vehiclesArray:Vehicle[] = [];
  public eventsArray:Event[] = [];
  public remindersArray:LocalNotificationSchema[] = [];
  public remindNotitications:boolean = false;
  public autoBackup:boolean = true;

  constructor(
    private _storageService: StorageService,
    private _storage:StorageService,
    private _test:UserTestService,
    private _authService:AuthService,
    private _notification:NotificationsService,
    private _platform:Platform,
    private _crypto:CryptoService
  ){
  }


  async searchphoto(method:string, id:string):Promise<string> {
    if(method === "email"){
      const photo = await this._storageService.getStorageItem(storageConstants.USER_PHOTO+id);
      if(photo){
        return imageConstants.base64Prefix+this._crypto.decryptMessage(photo);
      }else{
        return "../../assets/img/user_avatar.png";
      }
    }else{
      return "../../assets/img/user_avatar.png";
    }
  }

  async loadVehicles(): Promise<Vehicle[]>{
    const temporalVehiclesArray = await this._storage.getStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id);
    if(this._authService.isInTest == true){
      this.vehiclesArray = this._test.vehicles;
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
      //this.vehiclesArray = temporalVehiclesArray;
      return this.vehiclesArray;
    }else if(!temporalVehiclesArray){
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this._crypto.decryptMessage(JSON.stringify(this.vehiclesArray)));
      return this.vehiclesArray;
    }else{
      this.vehiclesArray = JSON.parse(this._crypto.decryptMessage(temporalVehiclesArray));
      return this.vehiclesArray;
    }
  }

  async loadEvents(): Promise<Event[]>{
    const temporalEventsArray = await this._storage.getStorageItem(storageConstants.USER_EVENTS+this.currentUser.id)
    if(this._authService.isInTest == true){
      this.eventsArray = this._test.events;
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
      //this.eventsArray = temporalEventsArray;
      return this.eventsArray;
    }else if(!temporalEventsArray){
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id, this._crypto.decryptMessage(JSON.stringify(this.eventsArray)));
      return this.eventsArray;
    }else{
      this.eventsArray = JSON.parse(this._crypto.decryptMessage(temporalEventsArray));
      return this.eventsArray;
    }
  }

  async loadReminders(): Promise<LocalNotificationSchema[]>{
    if(this._platform.is("android")){
      const temporalArray = await this._notification.getPending();
      let filteredArray:any[] = [];
      temporalArray.notifications.forEach(element => {
        if (this.vehiclesArray.some(vehicle => vehicle.id === element.extra.vehicleId)) {
          filteredArray.push(element);
        }
        });

      this.remindersArray = filteredArray;
      //console.log(filteredArray, temporalArray.notifications)
      return this.remindersArray;
    }else{
      //this.remindersArray = await this._test.createTestreminders(this.remindersArray);
      return this.remindersArray;
    }


  }

  async setReminderNotifications(reminder:boolean){
    this.remindNotitications = await this._storage.setStorageItem(storageConstants.USER_REMINDER+this.currentUser.id,reminder);
  }
  async getReminderNotifications():Promise<boolean>{
    this.remindNotitications = await this._storage.getStorageItem(storageConstants.USER_REMINDER+this.currentUser.id) || false;
    return this.remindNotitications;
  }

  async setAutoBackup(option:boolean){
    this.autoBackup = await this._storage.setStorageItem(storageConstants.USER_AUTBK+this.currentUser.id,option);
  }
  async getAutoBackup():Promise<boolean>{
    this.autoBackup = await this._storage.getStorageItem(storageConstants.USER_AUTBK+this.currentUser.id);
    //console.log(await this._storage.getStorageItem(storageConstants.USER_AUTBK+this.currentUser.id))
    return this.autoBackup;
  }

  deleteTemporalData(){
    this.vehiclesArray = [];
    this.eventsArray = [];
    this.remindersArray = [];
    this.remindNotitications = false;
  }

  setGoogleToken(token:string){
    this.currentUser.token = token;
    this._storageService.setStorageItem(storageConstants.USER_AUTH+this.currentUser.id,token)
  }
  async getToken():Promise<string>{
    const token = await this._storageService.getStorageItem(storageConstants.USER_AUTH+this.currentUser.id);
    if(token){
      this.currentUser.token = token;
      return token;
    }else{
      return "";
    }
  }


}

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
  public currency:string = "";
  public backupMail:string = "";

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


  async getUser():Promise<User>{
      return this.currentUser;
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
    //console.log(temporalVehiclesArray, this.vehiclesArray, this.currentUser)
    if(this._authService.isInTest == true){
      this.vehiclesArray = this._test.vehicles;
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
      //this.vehiclesArray = temporalVehiclesArray;
      return this.vehiclesArray;
    }else if(!temporalVehiclesArray){
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
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
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
      return this.eventsArray;
    }else{
      this.eventsArray = JSON.parse(this._crypto.decryptMessage(temporalEventsArray));
      return this.eventsArray;
    }
  }

  async loadReminders(): Promise<LocalNotificationSchema[]>{
    if(this._platform.is("android")||this._platform.is('ios')){
      const temporalArray = await this._notification.getPending();

      this.remindersArray = temporalArray.notifications;
      //console.log("Array Filtrado: ",temporalArray.notifications,"Array Teléfono: ",temporalArray.notifications)
      return this.remindersArray;
    }else{
      //this.remindersArray = await this._test.createTestreminders(this.remindersArray);
      return this.remindersArray;
    }
  }

  getFirstId(): Promise<number> {
    return new Promise((resolve) => {
      const usedIds = this.remindersArray.map(reminder => reminder.id);
      let firstFreeId = 1;

      while (usedIds.includes(firstFreeId)) {
        firstFreeId++;
      }

      resolve(firstFreeId);
    });
  }

  async setReminderNotifications(reminder:boolean){
    this.remindNotitications = reminder;
    await this._storage.setStorageItem(storageConstants.USER_REMINDER+this.currentUser.id,reminder);
  }
  async getReminderNotifications(): Promise<boolean> {
    const storedValue = await this._storage.getStorageItem(storageConstants.USER_REMINDER + this.currentUser.id);
    this.remindNotitications = storedValue !== null && storedValue !== undefined ? storedValue : true;
    return this.remindNotitications;
  }
  async setAutoBackup(option:boolean){
    this.autoBackup = option;
    await this._storage.setStorageItem(storageConstants.USER_AUTBK+this.currentUser.id,option);
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

  async insertVehicle(vehicle:Vehicle){
    this.vehiclesArray.push(vehicle);
    await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
  }

  async insertEvents(events:Event[]){
    for(const event of events){
      this.eventsArray.push(event);
    }
    await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
  }

  //ETIQUETAS
  async getTags(){
    const tempTags = await this._storage.getStorageItem(storageConstants.USER_TAGS + this.currentUser.id);
      if(tempTags){
        return JSON.parse(this._crypto.decryptMessage(tempTags));
      }else{
        return [];
      }
  }

}

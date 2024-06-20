import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { imageConstants } from '../const/img';
import { UserTestService } from './user-test.service';
import { AuthService } from './auth.service';
import { Vehicle } from '../models/vehicles.model';
import { Event } from '../models/event.model'
@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;
  public vehiclesArray:Vehicle[] = [];
  public eventsArray:Event[] = [];
  public remindNotitications:boolean = false;

  constructor(
    private _storageService: StorageService,
    private _storage:StorageService,
    private _test:UserTestService,
    private _authService:AuthService
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

  async setReminderNotifications(reminder:boolean){
    console.log("llega")
    this.remindNotitications = await this._storage.setStorageItem(storageConstants.USER_REMINDER+this.currentUser.id,reminder);
  }
  async getReminderNotifications(){
    this.remindNotitications = await this._storage.getStorageItem(storageConstants.USER_REMINDER+this.currentUser.id) || false;
  }
}

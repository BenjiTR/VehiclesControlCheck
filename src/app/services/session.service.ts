import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { imageConstants } from '../const/img';
import { UserTestService } from './user-test.service';
import { AuthService } from './auth.service';
import { Vehicle } from '../models/vehicles.model';
@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;
  public vehiclesArray:Vehicle[] = [];
  public eventsArray:Event[] = [];

  constructor(
    private _storageService: StorageService,
    private _storage:StorageService,
    private _test:UserTestService,
    private _authService:AuthService
  ){}


  async searchUserPhoto(method:string, id:string):Promise<string> {
    if(method === "email"){
      const userPhoto = await this._storageService.getStorageItem(storageConstants.USER_PHOTO+id);
      if(userPhoto){
        return imageConstants.base64Prefix+userPhoto;
      }else{
        return "../../assets/img/user_avatar.png";
      }
    }else{
      return "../../assets/img/user_avatar.png";
    }
  }

  async loadVehicles(): Promise<Vehicle[]>{
    const temporalVehiclesArray = await this._storage.getStorageItem(storageConstants.USER_VEHICLES+this.currentUser.userId)
    if(this._authService.isInTest){
      this.vehiclesArray = this._test.vehicles;
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.userId, this.vehiclesArray);
      const copy = this.vehiclesArray.map(obj=>({...obj}));
      return copy;
    }else if(!temporalVehiclesArray){
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.currentUser.userId, this.vehiclesArray)
      const copy = this.vehiclesArray.map(obj=>({...obj}));
      return copy;
    }else{
      this.vehiclesArray = {...temporalVehiclesArray};
      const copy = this.vehiclesArray.map(obj=>({...obj}));
      return copy;
    }
  }

  async loadEvents(): Promise<Event[]>{
  return this.eventsArray;
  }

}

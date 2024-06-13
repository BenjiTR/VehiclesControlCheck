import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { imageConstants } from '../const/img';
@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;

  constructor(
    private _storageService: StorageService,
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

}

import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;

  constructor(){}


  searchUserPhoto():string {
    return "../../assets/img/user_avatar.png";
  }

}

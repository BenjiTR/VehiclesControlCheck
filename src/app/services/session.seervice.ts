import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn:'root',
})


export class SessionService{

  public currentUser:User = new User;

  constructor(){}


}

import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn:'root',
})


export class sessionService{

  public currentUser:User = new User;

  constructor(){}


}

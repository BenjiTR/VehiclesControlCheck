import {Injectable } from '@angular/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn:'root'
})

export class DriveService{


  constructor(
    private _session:SessionService
  ){
  }




}

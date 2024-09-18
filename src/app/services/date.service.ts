import { Injectable } from '@angular/core';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { Event } from '../models/event.model';

@Injectable({
  providedIn:'root'
})

export class DateService {

  public getIsoDate(dateInput:any):string{
    const date = new Date(dateInput)
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset en milisegundos
    const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, -1)+ 'Z';
    return localISOTime;
  }

  isFutureEvent(reminderDate:Date){
    const rightNow = new Date().toISOString();
    const eventDate = new Date(reminderDate).toISOString();
    return rightNow < eventDate;
  }




}

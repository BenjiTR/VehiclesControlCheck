import { Injectable } from '@angular/core';

@Injectable({
  providedIn:'root'
})

export class DateService {

  public getIsoDate(dateInput:any):string{
    const date = new Date(dateInput)
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset en milisegundos
    const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, -1);
    return localISOTime;
  }



}

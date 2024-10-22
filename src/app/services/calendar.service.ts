import { Injectable, Injector } from '@angular/core';
import { backupConstants } from '../const/backup';
import { storageConstants } from '../const/storage';
import { DriveService } from './drive.service';
import { StorageService } from './storage.service';
import { Event } from '../models/event.model';
import { SessionService } from './session.service';
import { Network } from '@capacitor/network';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';
import { HashService } from './hash.service';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  public calendarId:string = "";
  private calendar = new BehaviorSubject<boolean|undefined>(undefined)
  public calendar$ = this.calendar.asObservable();
  private _session: SessionService | undefined;

  constructor(
    private _drive:DriveService,
    private _storage:StorageService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _hash:HashService,
    private injector: Injector
  ){
  }

  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }

  async init(){
    this.calendarId = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id);
    //console.log(this.calendarId)
  }


  // ACCIÓN PRINCIPAL DE CONECTAR EL CALENDARIO Y METER TODOS LOS EVENTOS
async connectCalendar(): Promise<void> {
  // Crear el calendario "Control de vehículos"
  if ((await Network.getStatus()).connected === true) {
    try {
      const calendarData = {
        summary: 'Control de vehículos',
      };

      const calendarResponse = await fetch(backupConstants.API_URL_CALENDAR, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this._drive.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarData)
      });

      // Comprobamos si la petición es correcta y memorizamos el id
      const calendar = await calendarResponse.json();
      if (!calendarResponse.ok) {
        throw this.translate.instant("error.error_in_the_calendar_creation_request");
      } else if (calendar && calendar.id) {
        this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id, calendar.id);
        this.calendarId = calendar.id;
        this.calendar.next(true);
      }

      // Creamos los eventos de calendar con los recordatorios
      await this.createAndInsertReminders();

    } catch (error: any) {
      console.log(error);
      throw error;
    }
  } else {
    this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant(""));
    return;
  }
}

private async createAndInsertReminders(): Promise<void> {
  const events: Event[] = await this.SessionService.loadEvents();
  if (events.length > 0) {
    for (const event of events) {
      if (event.reminder === true) {
        if(!event.calendarEventId){
          event.calendarEventId = await this._hash.generateCalendarPhrase();
        }
        await this.insertEvent(event); // Si ocurre un error, se lanzará y propagará
      }
    }
  }
}

public async insertEvent(event: Event): Promise<void> {
  if ((await Network.getStatus()).connected === true) {
    try {

      const newEvent = await this.generateCalendarEvent(event);

      //console.log(newEvent, this.calendarId)
      // Añadir los eventos al calendario
      const insert = await fetch(`${backupConstants.API_URL_CALENDAR}${this.calendarId}/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this._drive.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      });


      if (!insert.ok) {
        const errorResponse = await insert.json();
        console.log(errorResponse)
        throw this.translate.instant("error.error_in_the_event_creation_request");
      }

    } catch (error: any) {
      console.log(error);
      throw this.translate.instant("error.error_while_creating_the_event");
    }
  }else{
    this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant(""));
    return;
  }
}

// ACCIÓN PRINCIPAL DE DESCONECTAR CALENDAR Y ELIMINAR EL CALENDARIO
async deleteCalendar(): Promise<void> {
  if ((await Network.getStatus()).connected === true) {
    const calendarId = await this.findVehicleControlCalendar(); // Encuentra el calendarId
    //console.log(calendarId)
    if (calendarId) {
      try {
        await fetch(`${backupConstants.API_URL_CALENDAR}${calendarId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this._drive.token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch(error:any){
        console.log(error)
        throw this.translate.instant("error.error_while_deleting_the_calendar");
      }
    }else{
      throw this.translate.instant("error.calendar_could_not_be_found");
    }
  } else {
    this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant(""));
    return;
  }
}

// BUSCAR EL CALENDARIO
public async findVehicleControlCalendar(): Promise<string | null> {
  try {
    const response = await fetch(backupConstants.API_URL_CALENDAR_LIST, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this._drive.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Busca el calendario con el nombre "Control de Vehículos"
      const calendar = data.items.find((calendar: any) => calendar.summary === 'Control de vehículos');

      if (calendar) {
        this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id, calendar.id);
        this.calendarId = calendar.id;
        return calendar.id;  // Retorna el calendarId
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error al obtener los calendarios:', error);
    throw this.translate.instant("error.error_while_searching_the_calendar");
  }
}

// MODIFICAR EVENTO
public async updateEventInCalendar(event: Event): Promise<void> {
  try {

    const updatedEvent = await this.generateCalendarEvent(event);

    // Realiza la petición para actualizar el evento
    //console.log(this.calendarId)
    const response = await fetch(`${backupConstants.API_URL_CALENDAR}${this.calendarId}/events/${event.calendarEventId}`, {
      method: 'PUT', // Método PUT para actualizar
      headers: {
        Authorization: `Bearer ${this._drive.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedEvent)
    });

    // Comprobar si la actualización fue exitosa
    if (!response.ok) {
      const errorResponse = await response.json();
      throw errorResponse;
    }

  } catch (error: any) {
    console.log(error);
    throw error; // Propaga el error hacia arriba
  }
}

//BORRAR EVENTO DE CALENDAR
async deleteCalendarEvent(eventId:string){
  try{
    await fetch(`${backupConstants.API_URL_CALENDAR}${this.calendarId}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this._drive.token}`,
        'Content-Type': 'application/json'
      },
    });
  }catch{
    throw this.translate.instant("error.error_while_deleting_the_event");
  }
}


//GENERAR EVENTO DE CALENDAR
async generateCalendarEvent(event:Event):Promise<any>{

  const startDateTime = new Date(event.reminderDate as string | number | Date);
  const endDateTime = new Date(startDateTime.getTime() + 1 * 60 * 60 * 1000); // Sumar 1 hora


  const generatedEvent = {
    id:event.calendarEventId,
    summary: event.reminderTittle,
    description: event.info,
    start: {
      dateTime: startDateTime.toISOString(),
    },
    end: {
      dateTime: endDateTime.toISOString(),
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 0 }]
    }
  };
  return generatedEvent;
}


  //UTILIDAD PARA LLAMAR DE OTROS COMPONENTES
  async setEventInCalendar(event:Event):Promise<void>{
    if(!event.calendarEventId){
      event.calendarEventId = await this._hash.generateCalendarPhrase();
      await this.insertEvent(event);
    }else{
      await this.updateEventInCalendar(event)
      .catch((error:any)=>{
        console.log(error);
      })
    }
    return
  }

}

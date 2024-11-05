import { Injectable, Injector} from '@angular/core';
import { Event } from 'src/app/models/event.model';
import { SessionService } from '../session.service';
import { storageConstants } from 'src/app/const/storage';
import { StorageService } from '../storage.service';
import { HashService } from '../hash.service';
import { CalendarService } from '../calendar.service';
import { NotificationsService } from '../notifications.service';
import { CryptoService } from '../crypto.services';
import { DriveService } from '../drive.service';
import { Network } from '@capacitor/network';
import { SyncService } from '../sync.service';
import { AlertService } from '../alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalNotificationSchema } from '@capacitor/local-notifications';

@Injectable
({
  providedIn:'root'
})

export class eventService {

  private _session: SessionService | undefined;
  private _sync:SyncService | undefined;


  constructor(
    private injector: Injector,
    private _storage:StorageService,
    private _hash:HashService,
    private _calendar:CalendarService,
    private _notification:NotificationsService,
    private _crypto:CryptoService,
    private _drive:DriveService,
    private _alert:AlertService,
    private translate:TranslateService
  ){
  }

  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }

  private get SyncService(): SyncService {
    if (!this._sync) {
      this._sync = this.injector.get(SyncService);
    }
    return this._sync;
  }


  //CREAR EVENTO
  async createEvent(newEvent:Event) {

    const eventsArray =  this.SessionService.eventsArray;

    eventsArray.push(newEvent)
    const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id);
    if(id && newEvent.reminder){
      if(!newEvent.calendarEventId){
        newEvent.calendarEventId = await this._hash.generateCalendarPhrase();
      }
      this._calendar.insertEvent(newEvent);
    }
    this.saveAndExit(newEvent, eventsArray);
  }

  //EDITAR EVENTO
  async editEvent(newEvent:Event) {
    const eventsArray =  this.SessionService.eventsArray;
    const index = eventsArray.findIndex(event => event.id === newEvent.id);
    if (index !== -1) {
      const oldCalendarEventId = eventsArray[index].calendarEventId;
      const oldCalendarReminder= eventsArray[index].reminder;
      eventsArray[index] = newEvent;
      const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id);
      //console.log("id",id)
      if(id && newEvent.reminder){
        //console.log(newEvent.calendarEventId)
        if(!oldCalendarEventId){
          newEvent.calendarEventId = await this._hash.generateCalendarPhrase();
          this._calendar.insertEvent(newEvent);
        }else{
          newEvent.calendarEventId = oldCalendarEventId;
          this._calendar.updateEventInCalendar(newEvent);
        }
      }
      console.log(newEvent, oldCalendarReminder)
      if(id && !newEvent.reminder && oldCalendarReminder && oldCalendarEventId){
        console.log(newEvent, oldCalendarReminder)
        this._calendar.deleteCalendarEvent(oldCalendarEventId);
      }
      this.saveAndExit(newEvent, eventsArray);
    }
  }


  async saveAndExit(event: Event, eventsArray:Event[]) {

    if(event.reminder){
      await this.generateAndSaveNotification(event);
    }else{
      const reminder = await this.reminderExists(event);
      //console.log("Recordatorio dentro de evento: ",reminder);
      if(reminder){
        await this._notification.deleteNotification(reminder)
      }
    }

    this.SessionService.eventsArray = eventsArray;
    this._storage.setStorageItem(storageConstants.USER_EVENTS + this.SessionService.currentUser.id, this._crypto.encryptMessage(JSON.stringify(eventsArray)));
    this._drive.changeDownloading("refresh");
    this._drive.changeDownloading("false");
  }

  async uploadFile(fileType:string, file:any):Promise<void>{

    const newSyncHash = await this._hash.generateSyncPhrase();

    //console.log(fileType, file);

    let fileName;
    let encripted;

    if(fileType === "event"){
      fileName = file.id;
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }else{
      fileName = 'tags';
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }
    const DrivefileName = fileName+"-"+newSyncHash;

    //console.log(fileName, encripted);

    this._storage.setStorageItem(storageConstants.USER_OPS + this.SessionService.currentUser.id, true)
    if ((await Network.getStatus()).connected === true) {
      const exist = await this._drive.findFileByName(fileName)
      if (exist) {
        //console.log(exist);
        this._drive.updateFile(exist, encripted, DrivefileName, true);
      } else {
        this._drive.uploadFile(encripted, DrivefileName, true);
      }
      this.SyncService.updateSyncList(DrivefileName);
      this._storage.setStorageItem(storageConstants.USER_OPS + this.SessionService.currentUser.id, false)
    } else {
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
      this._drive.folderId = "";
    }
    return;
  }


  async generateAndSaveNotification(event:Event):Promise<void>{
    const reminder = await this._notification.constructReminder(event);
    this._notification.createNotification([reminder])
  }


  async reminderExists(event:Event):Promise<LocalNotificationSchema|undefined>{
    const remindersArray = await this.SessionService.loadReminders();
    const reminder = remindersArray.find(reminder=>reminder.extra.eventId === event.id);
    //console.log("recordatorio: ",reminder);
    return reminder;
  }


  async deleteEvent(event:Event){
    await this.deleteEventProcess(event);
    if(this._drive.folderId && this.SessionService.autoBackup){
      this._storage.setStorageItem(storageConstants.USER_OPS+this.SessionService.currentUser.id,true)
      if((await Network.getStatus()).connected === true){
        const id = await this._drive.findFileByName(event.id)
        if(id){
          await this._drive.deleteFile(id, true);
          await this.SyncService.deleteFileInList(event.id);
        }
        this._storage.setStorageItem(storageConstants.USER_OPS+this.SessionService.currentUser.id,false)
      }else{
        this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
        this._drive.folderId = "";
      }
    }
    if(event.reminder){
      const array = await this._notification.getPending();
      const remindersArray = array.notifications;
      const reminder = remindersArray.find(reminder=>reminder.extra.eventId === event.id);
      if(reminder){
        this._notification.deleteNotification(reminder)
      }
    }
    const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this.SessionService.currentUser.id);
    if(id && event.calendarEventId){
      this._calendar.deleteCalendarEvent(event.calendarEventId);
    }
  }


  async deleteEventProcess(event:Event):Promise<void>{
    const eventsArray =  this.SessionService.eventsArray;
    const index = eventsArray.findIndex(e => e.id === event.id);
    eventsArray.splice(index,1)
    this.SessionService.eventsArray = eventsArray;
    await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(eventsArray)));
    return;
  }


}

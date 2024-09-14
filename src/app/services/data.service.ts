import {Injectable, Injector } from '@angular/core';
import { Backup } from '../models/backup.model';
import { storageConstants } from '../const/storage';
import { DateService } from './date.service';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';
import { NotificationsService } from './notifications.service';
import { imageConstants } from '../const/img';
import { Platform } from '@ionic/angular';
import { CryptoService } from './crypto.services';
import { DriveService } from './drive.service';

@Injectable({
  providedIn:'root'
})

export class DataService{

  private _drive: DriveService | undefined;


  constructor(
    private _session:SessionService,
    private _storage:StorageService,
    private _notifications:NotificationsService,
    private translate:TranslateService,
    private _date:DateService,
    private _platform:Platform,
    private _crypto:CryptoService,
    private injector: Injector // Injector en lugar de DriveService
  ){
  }

  private get driveService(): DriveService {
    if (!this._drive) {
      this._drive = this.injector.get(DriveService);
    }
    return this._drive;
  }

  async buildData(){
    const backup:Backup = {
      vehicles: await this._session.loadVehicles(),
      events: await this._session.loadEvents(),
      reminders: await this._session.loadReminders(),
      remindersOptions: await this._session.getReminderNotifications(),
      autoBackup: await this._session.getAutoBackup(),
      photo: await this._storage.getStorageItem(storageConstants.USER_PHOTO+this._session.currentUser.id) || "",
      tags: await this._storage.getStorageItem(storageConstants.USER_TAGS + this._session.currentUser.id) || []
    }
    return backup
  }


  async buildDeviceData():Promise<string>{
    const backup = await this.buildData();
    //console.log(backup ,JSON.stringify(backup))
    return this._crypto.encryptMessage(JSON.stringify(backup));
  }

  async restoreDeviceData(backup:Backup):Promise<void>{
    //console.log(this._session.currentUser.id, backup)
    this._storage.setStorageItem(storageConstants.USER_VEHICLES+this._session.currentUser.id, this._crypto.encryptMessage(JSON.stringify(backup.vehicles)));
    this._storage.setStorageItem(storageConstants.USER_EVENTS+this._session.currentUser.id, this._crypto.encryptMessage(JSON.stringify(backup.events)));

    this._session.setReminderNotifications(backup.remindersOptions);
    const correctReminders = await this._date.setDatesInArray(backup.reminders);
    if(this._platform.is("android")||this._platform.is('ios')){

      const remindersCopy = [...correctReminders];

      for (const reminder of remindersCopy) {

        const rightNow = new Date();
        const reminderDate = new Date(reminder.schedule!.at!)

        if(reminderDate<rightNow){

          const indexToRemove = correctReminders.indexOf(reminder);
          if (indexToRemove > -1) {
            correctReminders.splice(indexToRemove, 1);
          }

          const id = await this.driveService.findFileByName("R"+reminder.id)
          await this.driveService.deleteFile(id, true);

        }

        await this._notifications.createNotification(correctReminders);
      }
    }
    this._session.setAutoBackup(backup.autoBackup)
    if(backup.photo){

      this._storage.setStorageItem(storageConstants.USER_PHOTO+this._session.currentUser.id,backup.photo)
      this._session.currentUser.photo = imageConstants.base64Prefix + this._crypto.decryptMessage(backup.photo);
    }
    this._storage.setStorageItem(storageConstants.USER_TAGS+this._session.currentUser.id,this._crypto.encryptMessage(JSON.stringify(backup.tags)));
    return;
  }

  async buildDriveData(): Promise<any[]> {
    const arrayBackup: any[] = [];
    const backup:Backup = await this.buildData();

    // Vehículos
    backup.vehicles.forEach((vehicle) => {
      const fileName = vehicle.id;
      arrayBackup.push({ fileName, content: this._crypto.encryptMessage(JSON.stringify(vehicle)) });
    });

    // Eventos
    backup.events.forEach((event) => {
      const fileName = event.id;
      arrayBackup.push({ fileName, content: this._crypto.encryptMessage(JSON.stringify(event)) });
    });

    // Recordatorios
    backup.reminders.forEach((reminder) => {
      const fileName = `R${reminder.id}`;
      arrayBackup.push({ fileName, content: JSON.stringify(reminder) });
    });

    // Opción de recordatorios
    const remindersOptionsFileName = `remindersOptions`;
    //console.log(backup.remindersOptions)
    let optionString:string;
    if(backup.remindersOptions){
      optionString = "true";
    }else{
      optionString = "false";
    }
    arrayBackup.push({ fileName: remindersOptionsFileName, content: optionString });

    //AutoBk

    const autobackupFileName = `autoBackup`;
    arrayBackup.push({ fileName: autobackupFileName, content: backup.autoBackup });

    // Foto
    const photoFileName = `photo`;
    arrayBackup.push({ fileName: photoFileName, content: backup.photo });

    //Tags
    const tagsFilename = `tags`
    arrayBackup.push({ fileName: tagsFilename, content: backup.tags });

    return arrayBackup;

  }

  async buildCsvData(eventTypes: any): Promise<string> {
    const eventsArray = this._session.eventsArray;

    const headers = [
        'id',
        'vehicleId',
        'date',
        'type',
        'km',
        'cost',
        'aditional_info'
    ].map(header => this.translate.instant('event.' + header));

    // Mapeo de tipos de eventos
    const eventTypeMap = new Map(eventTypes.map((eventType: { name: any; string: any; }) => [eventType.name, eventType.string]));

    // Datos de eventos
    const csvRows = eventsArray.map(event => [
        event.id,
        event.vehicleId,
        event.date,
        eventTypeMap.get(event.type) || event.type,
        event.km,
        event.cost,
        event.info
    ]);

    // Añadir encabezados a los datos
    csvRows.unshift(headers);

    // Convertir a CSV string
    const csvString = csvRows.map(row => row.join(',')).join('\n');

    return csvString;
}


}

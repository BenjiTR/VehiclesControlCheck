import {Injectable, Injector } from '@angular/core';
import { Backup } from '../models/backup.model';
import { storageConstants } from '../const/storage';
import { DateService } from './date.service';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';
import { imageConstants } from '../const/img';
import { Platform } from '@ionic/angular';
import { CryptoService } from './crypto.services';
import { DriveService } from './drive.service';
import { HashService } from './hash.service';


@Injectable({
  providedIn:'root'
})

export class DataService{

  private _session: SessionService | undefined;

  constructor(
    private _storage:StorageService,
    private translate:TranslateService,
    private _date:DateService,
    private _platform:Platform,
    private _crypto:CryptoService,
    private injector: Injector,
    private _hash:HashService
  ){
  }

  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }


  async buildData(){
    const backup:Backup = {
      vehicles: await this.SessionService.loadVehicles(),
      events: await this.SessionService.loadEvents(),
      remindersOptions: await this.SessionService.getReminderNotifications(),
      autoBackup: await this.SessionService.getAutoBackup(),
      photo: await this._storage.getStorageItem(storageConstants.USER_PHOTO+this.SessionService.currentUser.id) || "",
      tags: await this.SessionService.getTags()
    }
    return backup
  }


  async buildDeviceData():Promise<string>{
    const backup = await this.buildData();
    //console.log(backup ,JSON.stringify(backup))
    return this._crypto.encryptMessage(JSON.stringify(backup));
  }

  async restoreDeviceData(backup:Backup):Promise<void>{
    //console.log(this.SessionService.currentUser.id, backup)
    this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.SessionService.currentUser.id, this._crypto.encryptMessage(JSON.stringify(backup.vehicles)));
    this._storage.setStorageItem(storageConstants.USER_EVENTS+this.SessionService.currentUser.id, this._crypto.encryptMessage(JSON.stringify(backup.events)));

    this.SessionService.setReminderNotifications(backup.remindersOptions);
    this.SessionService.setAutoBackup(backup.autoBackup);
    if(backup.photo){

      this._storage.setStorageItem(storageConstants.USER_PHOTO+this.SessionService.currentUser.id,backup.photo);
      this.SessionService.currentUser.photo = imageConstants.base64Prefix + this._crypto.decryptMessage(backup.photo);
    }
    this._storage.setStorageItem(storageConstants.USER_TAGS+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(backup.tags)));
    return;
  }

  async buildDriveData(): Promise<any[]> {
    const arrayBackup: any[] = [];
    const backup:Backup = await this.buildData();
    const newSyncHash = await this._hash.generateSyncPhrase();

    // Vehículos
    backup.vehicles.forEach(async (vehicle) => {
      const fileName = vehicle.id + "-" + newSyncHash;
      arrayBackup.push({ fileName, content: this._crypto.encryptMessage(JSON.stringify(vehicle)) });
    });

    // Eventos
    backup.events.forEach((event) => {
      const fileName = event.id + "-" + newSyncHash;
      arrayBackup.push({ fileName, content: this._crypto.encryptMessage(JSON.stringify(event)) });
    });

    // Opción de recordatorios
    const remindersOptionsFileName = `remindersOptions` + "-" + newSyncHash;
    //console.log(backup.remindersOptions)
    let optionString:string;
    if(backup.remindersOptions){
      optionString = "true";
    }else{
      optionString = "false";
    }
    arrayBackup.push({ fileName: remindersOptionsFileName, content: optionString });

    //AutoBk

    const autobackupFileName = `autoBackup` + "-" + newSyncHash;
    arrayBackup.push({ fileName: autobackupFileName, content: backup.autoBackup });

    //Foto
    const photoFileName = `photo` + "-" + newSyncHash;
    arrayBackup.push({ fileName: photoFileName, content: backup.photo });

    //Tags
    const tagsFilename = `tags` + "-" + newSyncHash;
    arrayBackup.push({ fileName: tagsFilename, content: this._crypto.encryptMessage(JSON.stringify(backup.tags)) });

    return arrayBackup;
  }

  async buildCsvData(eventTypes: any): Promise<string> {
    const eventsArray = this.SessionService.eventsArray;

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

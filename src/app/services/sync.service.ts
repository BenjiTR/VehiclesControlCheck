import { Vehicle } from 'src/app/models/vehicles.model';
import { DriveService } from 'src/app/services/drive.service';
import { Injectable, Injector } from '@angular/core';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { User } from '../models/user.model';
import { SessionService } from './session.service';
import { CryptoService } from './crypto.services';
import { Event } from '../models/event.model';
import { imageConstants } from '../const/img';
import { Subscription } from 'rxjs';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn:'root'
})

export class SyncService{

  private syncFiles:string[] | undefined;
  private _session: SessionService | undefined;
  private _drive: DriveService | undefined;
  private eventsArray:Event[]|undefined;
  private vehiclesArray:Vehicle[]|undefined;
  public autoBk:boolean = true;
  private autoBkSubscription:Subscription;

  constructor(
    private _storage:StorageService,
    private _crypto:CryptoService,
    private injector: Injector,
    private _notifications:NotificationsService
  ){
    this.autoBkSubscription = this.DriveService.autoBk$.subscribe(value=>{
      this.autoBk = value;
    })
  }

  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }

  private get DriveService(): DriveService {
    if (!this._drive) {
      this._drive = this.injector.get(DriveService)
    }
    return this._drive;
  }

  //CARGAR Y GUARDAR
  async getSyncFile():Promise<string[]>{
    const user:User = await this.SessionService.getUser();
    const data = await this._storage.getStorageItem(storageConstants.SYNC_REFERENCE+user.id);
    if(data){
      console.log('syncFile Obtenido: ',JSON.parse(this._crypto.decryptMessage(data)));
      return JSON.parse(this._crypto.decryptMessage(data));
    }else{
      return [];
    }
  }

  async setSyncFile(syncFile:string[]):Promise<void>{
    const user:User = await this.SessionService.getUser();
    //console.log("array de Backup", syncFile)
    //console.log('syncfile Guardado: ', this._crypto.encryptMessage(JSON.stringify(syncFile)))
    return await this._storage.setStorageItem(storageConstants.SYNC_REFERENCE+user.id, this._crypto.encryptMessage(JSON.stringify(syncFile)))
  }


  //PROCESO DE SINCRONIZACIÓN
  async syncData(Arraydata:any[]){
    if(this.autoBk){
      console.log("datos entrantes: ",Arraydata);
      for (const data of Arraydata) {
        const isOK = await this.isFileInSyncFiles(data.name);
          if(!isOK){
            this.DriveService.changeDownloading('true');
            await this.secctionDataForUpdate(data);
            this.DriveService.changeDownloading('false');
          }
      }

      if(Arraydata.length < this.syncFiles!.length){

        const syncFilesCopy = [...this.syncFiles!]; // Crear una copia de la lista original

        for (const data of syncFilesCopy){
          const isOK = await this.isFileInArrayData(data, Arraydata);
          if(!isOK){
            this.DriveService.changecleaning(true);
            await this.secctionDataForDelete(data);
            this.DriveService.changecleaning(false);
          }
        }
      }
    }
  }


    //ACTUALIZAR O ESCRIBIR LOS DATOS NO ENCONTRADOS
    private async secctionDataForUpdate(data:any):Promise<void>{

      const headName = data.name.split("-")[0];
      const downloadedData = await this.DriveService.downloadFile(data.id);


      if (headName === "photo") {
        await this.syncPhoto(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName === "remindersOptions") {
        await this.syncRemindersOptions(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName === "autoBackup") {
        await this.syncAutobackup(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName.startsWith("V")) {
        await this.syncVehicle(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName.startsWith("E")) {
        await this.syncEvent(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName === "tags"){
        await this.syncTags(downloadedData);
        this.updateSyncList(data.name);
      }

      if(this.eventsArray){
        await this._notifications.setNotifications(this.eventsArray!);
      }

      return;

    }

    //BORRAR LOS DATOS NO ENCONTRADOS
    private async secctionDataForDelete(data:any):Promise<void>{

      const headName = data.split("-")[0];
      console.log(headName);

      if (headName.startsWith("V")) {
        await this.deleteVehicle(data);
        this.updateSyncList(data, true);
      } else if (headName.startsWith("E")) {
        await this.deleteEvent(data);
        this.updateSyncList(data, true);
      }

      if(this.eventsArray){
        await this._notifications.setNotifications(this.eventsArray!);
      }

      return;

    }

    //SINCRONIZAR TAGS
    private async syncTags(downloadedData:string){
      const decryptedData:Event = JSON.parse(this._crypto.decryptMessage(downloadedData));
      await this._storage.setStorageItem(storageConstants.USER_TAGS + this.SessionService.currentUser.id, this._crypto.encryptMessage(JSON.stringify(decryptedData)));
    }

    //BORRAR EVENTO
    private async deleteEvent(event:string){
      if(!this.eventsArray){
        this.eventsArray = this._session?.eventsArray;
      }
      const headEvent = event.split("-")[0];

      const i = this.eventsArray?.findIndex(v=>v.id===headEvent);
      if(i){
        this.eventsArray?.splice(i,1)
      }
      //console.log(i)
      console.log(this.eventsArray)

      await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
      return;
    }

    //SINCRONIZAR EVENTO
    private async syncEvent(downloadedData:string){
      const decryptedData:Event = JSON.parse(this._crypto.decryptMessage(downloadedData));
      if(!this.eventsArray){
        this.eventsArray = this._session?.eventsArray;
      }
      const i = this.eventsArray?.findIndex(v=>v.id===decryptedData.id);
      if(i !== -1 && i !== undefined){
        this.eventsArray![i] = decryptedData;
      }else{
        this.eventsArray!.push(decryptedData);
      }
      await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
      return;
    }

    //BORRAR VEHÍCULO
    private async deleteVehicle(vehicle:Vehicle){
      if(!this.vehiclesArray){
        this.vehiclesArray = this._session?.vehiclesArray;
      }

      const i = this.vehiclesArray?.findIndex(v=>v.id===vehicle.id);
      if(i){
        this.vehiclesArray?.splice(i,1)
      }

      await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
      return;
    }

    //SINCRONIZAR VEHÍCULO
    private async syncVehicle(downloadedData:string):Promise<void>{
      const decryptedData:Vehicle = JSON.parse(this._crypto.decryptMessage(downloadedData));
      if(!this.vehiclesArray){
        this.vehiclesArray = this._session?.vehiclesArray;
      }
      const i = this.vehiclesArray?.findIndex(v=>v.id===decryptedData.id);
      if(i !== -1 && i !== undefined){
        this.vehiclesArray![i] = decryptedData;
      }else{
        this.vehiclesArray?.push(decryptedData);
      }
      await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.SessionService.currentUser.id,this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));
      return;
    }

    //SINCRONIZAR AUTOBACKUP
    private async syncAutobackup(downloadedData:string):Promise<void>{
      let data:boolean;
      if(downloadedData === 'true'){
        data = true;
      }else{
        data = false;
      }
      this.SessionService.setAutoBackup(data);
      return;
    }

    //SINCRONIZAR OPCIONES DE RECORDATORIO
    private async syncRemindersOptions(downloadedData:string):Promise<void>{
      let data:boolean;
      if(downloadedData === 'true'){
        data = true;
      }else{
        data = false;
      }
      this.SessionService.setReminderNotifications(data);
      return;
    }

    //SINCRONIZAR FOTO
    private async syncPhoto(downloadedData:string):Promise<void>{
      this._storage.setStorageItem(storageConstants.USER_PHOTO+this.SessionService.currentUser.id,downloadedData);
      //console.log(downloadedData)
      if(downloadedData){
        this.SessionService.currentUser.photo = imageConstants.base64Prefix + this._crypto.decryptMessage(downloadedData);
      }else{
        this.SessionService.currentUser.photo = '../../../../../assets/img/user_avatar.png';
      }
      return;
    }



  //COMPROBAR SI EL ARCHIVO ESTÁ EN LA LISTA
  async isFileInSyncFiles(fileToCompare:string):Promise<boolean>{
    if(!this.syncFiles){
      this.syncFiles = await this.getSyncFile();
    }
    return this.syncFiles.some(f=>f===fileToCompare);
  }

  async isFileInArrayData(fileToCompare:string, arraydata:any):Promise<boolean>{
    return arraydata.some((a:any)=>a.name===fileToCompare);
  }

  //ACTUALIZAR LISTA
  async updateSyncList(fileName:string, toDelete?:boolean):Promise<void>{
    const headFileName = fileName.split("-")[0];
    if(!this.syncFiles){
      this.syncFiles = await this.getSyncFile();
    }
    const i = this.syncFiles.findIndex(f=>f.startsWith(headFileName));

    if(i != -1 && toDelete){
      this.syncFiles.splice(i,1);
      await this.setSyncFile(this.syncFiles);
    }else if(i != -1 && !toDelete){
      this.syncFiles[i] = fileName;
      await this.setSyncFile(this.syncFiles);
    }else{
      this.syncFiles.push(fileName);
      await this.setSyncFile(this.syncFiles);
    }
  }

  //ELIMINAR ELEMENTO DE LA LISTA
  async deleteFileInList(fileName:string):Promise<void>{
    const headFileName = fileName.split("-")[0];
    if(!this.syncFiles){
      this.syncFiles = await this.getSyncFile();
    }
    const i = this.syncFiles.findIndex(f=>f.startsWith(headFileName));
    if(i != -1){
      this.syncFiles.splice(i,1);
      await this.setSyncFile(this.syncFiles);
    }
  }

}

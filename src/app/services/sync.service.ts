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

@Injectable({
  providedIn:'root'
})

export class SyncService{

  private syncFiles:string[] | undefined;
  private _session: SessionService | undefined;
  private _drive: DriveService | undefined;
  private eventsArray:Event[]|undefined;
  public autoBk:boolean = true;
  private autoBkSubscription:Subscription;

  constructor(
    private _storage:StorageService,
    private _crypto:CryptoService,
    private injector: Injector,

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
    console.log("array de Backup", syncFile)
    console.log('syncfile Guardado: ', this._crypto.encryptMessage(JSON.stringify(syncFile)))
    return await this._storage.setStorageItem(storageConstants.SYNC_REFERENCE+user.id, this._crypto.encryptMessage(JSON.stringify(syncFile)))
  }


  //PROCESO DE SINCRONIZACIÓN
  async syncData(Arraydata:any[]){
    if(this.autoBk){
      console.log("datos entrantes: ",Arraydata);
      for (const data of Arraydata) {
        const isOK = await this.isFileInSyncFiles(data.name);
          if(!isOK){
            await this.secctionDataForUpdate(data);
          }
      }
    }
  }


    //ACTUALIZAR O ESCRIBIR LOS DATOS NO ENCONTRADOS
    private async secctionDataForUpdate(data:any):Promise<void>{

      const headName = data.name.split("-")[0];
      const downloadedData = await this.DriveService.downloadFile(data.id);


      if (headName === "photo") {
        await this.restorephoto(downloadedData);
        this.updateSyncList(data.name);
      } else if (headName === "remindersOptions") {

      } else if (headName === "autoBackup") {

      } else if (headName.startsWith("V")) {

      } else if (headName.startsWith("E")) {

      } else if (headName === "tags"){

      }

      return;

    }


    //RESTAURAR FOTO
    private async restorephoto(downloadedData:string):Promise<void>{
      this._storage.setStorageItem(storageConstants.USER_PHOTO+this.SessionService.currentUser.id,downloadedData);
      console.log(downloadedData)
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

  //ACTUALIZAR LISTA
  async updateSyncList(fileName:string):Promise<void>{
    const headFileName = fileName.split("-")[0];
    if(!this.syncFiles){
      this.syncFiles = await this.getSyncFile();
    }
    const i = this.syncFiles.findIndex(f=>f.startsWith(headFileName));
    if(i != -1){
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

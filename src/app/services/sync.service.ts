import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { User } from '../models/user.model';
import { SessionService } from './session.service';
import { CryptoService } from './crypto.services';

@Injectable({
  providedIn:'root'
})

export class SyncService{

  private syncFiles:string[] | undefined;

  constructor(
    private _storage:StorageService,
    private _session:SessionService,
    private _crypto:CryptoService
  ){

  }

  //CARGAR Y GUARDAR
  async getSyncFile():Promise<string[]>{
    const user:User = await this._session.getUser();
    console.log('syncFile Obtenido: ',JSON.parse(this._crypto.decryptMessage(await this._storage.getStorageItem(storageConstants.SYNC_REFERENCE+user.id)))  )
    return JSON.parse(this._crypto.decryptMessage(await this._storage.getStorageItem(storageConstants.SYNC_REFERENCE+user.id)))||[];
  }

  async setSyncFile(syncFile:string[]):Promise<void>{
    const user:User = await this._session.getUser();
    console.log("array de Backup", syncFile)
    console.log('syncfile Guardado: ', this._crypto.encryptMessage(JSON.stringify(syncFile)))
    return await this._storage.setStorageItem(storageConstants.SYNC_REFERENCE+user.id, this._crypto.encryptMessage(JSON.stringify(syncFile)))
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

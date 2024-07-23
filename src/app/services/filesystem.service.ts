import {Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding, WriteFileResult, ReadFileResult } from '@capacitor/filesystem';
import { Backup } from '../models/backup.model';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';
import { NotificationsService } from './notifications.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateService } from './date.service';
import { DataService } from './data.service';

@Injectable({
  providedIn:'root'
})

export class FileSystemService{


  constructor(
    private _session:SessionService,
    private _storage:StorageService,
    private _notifications:NotificationsService,
    private translate:TranslateService,
    private _date:DateService,
    private _data:DataService
  ){
  }

  async checkPermission():Promise<string>{
    const perm = await Filesystem.checkPermissions();
    if (perm.publicStorage === "granted"){
      return perm.publicStorage;
    }else{
      const request = await Filesystem.requestPermissions();
      return request.publicStorage;
    }
  }

  async createBackupFile():Promise<WriteFileResult>{
    return await Filesystem.writeFile({
      path: "vehicles-control/"+this._session.currentUser.id +'.vcc',
      data: await this._data.buildDeviceData(),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive:true
    })
  }


  async restoreBackup():Promise<void> {

    await FilePicker.pickFiles({
      types: ['application/octet-stream'],
      limit: 1
    })
    .then(async (result)=>{
      if (result.files) {
        const file = result.files[0];
        console.log(result, result.files);

        // Verifica la extensión del archivo
        if (file.name.endsWith('.vcc') && file.path) {
          // Lee el contenido del archivo
          const readFile = await Filesystem.readFile({
            path: file.path,
            encoding: Encoding.UTF8
          });

          const data = JSON.parse(readFile.data.toString())
          const correctUser = await this.itsForThisUser(data)
          if(!correctUser){
            throw new Error('Usuario incorrecto');
          }else{
            await this._data.restoreDeviceData(data);
            return;
          }
        } else {
          throw new Error('Archivo no válido');
        }
      }
    })
    .catch((e)=>{
      console.error('Error al leer el archivo:', e);
      throw e;
    })
  }


  async itsForThisUser(data:Backup):Promise<boolean>{
    return data.vehicles.some(vehicle => vehicle.userId === this._session.currentUser.id);
  }





}
